import { settings } from '@/lib/settings'
import {
  PrismaClient,
  Prisma,
  PurchaseStatus,
  TicketStatus,
} from '@prisma/client'
import { sendEmail } from '@/lib/email'
import { prisma } from '@/lib/db'
import { Stripe } from 'stripe'
import { NextResponse } from 'next/server'
import { generateTicketConfirmationEmail } from '@/lib/email'
import { EmailData } from '@/lib/types'
import { WebhookHandlerResponse } from './types'

const prismaClient = new PrismaClient()

export async function handlePaymentSuccess(
  ticketIds: string[],
  campaignId: string,
  userId: string,
  paymentIntentId: string,
  amount: number
): Promise<WebhookHandlerResponse> {
  if (ticketIds.length === 0) {
    return {
      received: false,
      error: 'No ticket IDs found',
      status: 400,
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // First, try to find an existing purchase
      const existingPurchase = await tx.purchase.findFirst({
        where: {
          stripePaymentIntentId: paymentIntentId,
        },
      })

      if (existingPurchase) {
        await tx.purchase.update({
          where: { id: existingPurchase.id },
          data: {
            status: PurchaseStatus.CONFIRMED,
            totalAmount: amount,
          },
        })
      } else {
        await tx.purchase.create({
          data: {
            stripePaymentIntentId: paymentIntentId,
            campaignId,
            userId,
            status: PurchaseStatus.CONFIRMED,
            totalAmount: amount,
            tickets: {
              connect: ticketIds.map((id) => ({ id })),
            },
          },
        })
      }

      // Update tickets in a single query
      await tx.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: {
          status: TicketStatus.CONFIRMED,
        },
      })

      // Update campaign with locking
      const campaign = await tx.campaign.findUnique({
        where: { id: campaignId },
        select: { currentTickets: true, ticketCap: true }
      })

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      if (campaign.currentTickets + ticketIds.length > campaign.ticketCap) {
        throw new Error('Campaign ticket cap would be exceeded')
      }

      await tx.campaign.update({
        where: { id: campaignId },
        data: {
          currentTickets: {
            increment: ticketIds.length,
          },
        },
      })
    })

    // Get tickets with orders for the email
    const tickets = await prisma.ticket.findMany({
      where: { id: { in: ticketIds } },
      include: {
        purchase: {
          include: {
            orders: {
              include: {
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    venueId: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
                choices: {
                  include: {
                    option: {
                      select: {
                        name: true,
                      },
                    },
                    selectedChoice: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        campaign: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (tickets.length === 0) {
      return {
        received: false,
        error: 'No tickets found',
        status: 404,
      }
    }

    // Group tickets by purchase ID
    const ticketsByPurchase = tickets.reduce((acc, ticket) => {
      const purchaseId = ticket.purchaseId
      if (!acc[purchaseId]) {
        acc[purchaseId] = []
      }
      acc[purchaseId].push(ticket)
      return acc
    }, {} as Record<string, typeof tickets>)

    // Send one email per purchase
    for (const [purchaseId, purchaseTickets] of Object.entries(ticketsByPurchase)) {
      const emailData = {
        movieTitle: purchaseTickets[0].campaign.movieTitle,
        venueName: purchaseTickets[0].campaign.venue.name,
        screeningDate: purchaseTickets[0].campaign.screeningDate,
        ticketQuantity: purchaseTickets.length,
        totalAmount: amount,
        regularTickets: purchaseTickets.filter(t => t.status === TicketStatus.CONFIRMED).length,
        pifTickets: purchaseTickets.filter(t => t.status === TicketStatus.PAY_IT_FORWARD).length,
        ticketPrice: Number(purchaseTickets.find(t => t.status === TicketStatus.CONFIRMED)?.pricePaid || settings.minimumTicketPrice),
        foodOrders: purchaseTickets[0].purchase?.orders.map((order) => ({
          name: order.menuItem.name,
          quantity: order.quantity,
          price: Number(order.menuItem.price),
          options: order.choices.map((choice) => ({
            name: choice.option.name,
            choice: choice.selectedChoice.name,
          })),
        })) || [],
      }

      const emailHtml = generateTicketConfirmationEmail(emailData)
      const emailSent = await sendEmail({
        to: purchaseTickets[0].user.email,
        subject: `Your tickets for ${purchaseTickets[0].campaign.movieTitle}`,
        html: emailHtml
      })

      if (!emailSent) {
        console.error(`Failed to send confirmation email for purchase ${purchaseId}`)
      }
    }

    return {
      received: true,
      status: 200,
    }
  } catch (error) {
    console.error('Error processing payment success:', error)
    return {
      received: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      status: 500,
    }
  }
}

export async function handlePaymentFailure(
  ticketIds: string[]
): Promise<WebhookHandlerResponse> {
  try {
    await prismaClient.ticket.deleteMany({
      where: { id: { in: ticketIds } },
    })

    return { received: true }
  } catch (error) {
    console.error('Error processing payment failure:', error)
    return {
      received: false,
      error: 'Failed to process payment failure',
      status: 500,
    }
  }
}

interface Campaign {
  title: string
  venue: {
    name: string
  }
  screeningDate: Date
}

interface Ticket {
  id: string
  type: TicketStatus
  purchaseId: string
}

function generateConfirmationEmail(
  campaign: Campaign,
  amount: number,
  tickets: Ticket[]
): string {
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })

  const formatPrice = (price: number | Prisma.Decimal) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(Number(price) / 100)

  const ticketList = tickets
    .map((ticket) => {
      return `
        <div style="margin-bottom: 20px;">
          <h3>Ticket #${ticket.id}</h3>
        </div>
      `
    })
    .join('')

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Ticket Confirmation</h1>
      <h2>${campaign.title}</h2>
      <p>
        <strong>Venue:</strong> ${campaign.venue.name}<br>
        <strong>Date:</strong> ${formatDate(campaign.screeningDate)}<br>
        <strong>Total Amount:</strong> ${formatPrice(amount)}
      </p>
      ${ticketList}
      <p>Thank you for your purchase!</p>
    </div>
  `
}
