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
    // Update ticket status to confirmed and increment campaign's currentTickets
    await prisma.$transaction(async (tx) => {
      // First, try to find an existing purchase with this payment intent ID
      const existingPurchase = await tx.purchase.findFirst({
        where: {
          stripePaymentIntentId: paymentIntentId,
        },
      })

      if (existingPurchase) {
        // If purchase exists, update it
        await tx.purchase.update({
          where: { id: existingPurchase.id },
          data: {
            status: PurchaseStatus.CONFIRMED,
            totalAmount: amount,
          },
        })
      } else {
        // If no purchase exists, create a new one
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

      // Update ticket status to confirmed
      await tx.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: {
          status: TicketStatus.CONFIRMED,
        },
      })

      // Update campaign ticket count
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

    // Transform ticket data for customer confirmation email
    const emailData: EmailData = {
      movieTitle: tickets[0].campaign.movieTitle,
      venueName: tickets[0].campaign.venue.name,
      screeningDate: tickets[0].campaign.screeningDate,
      ticketQuantity: tickets.length,
      totalAmount: amount / 100, // Convert from cents to pounds
      regularTickets: tickets.filter((t) => t.status === TicketStatus.CONFIRMED)
        .length,
      pifTickets: tickets.filter(
        (t) => t.status === TicketStatus.PAY_IT_FORWARD
      ).length,
      foodOrders: tickets.flatMap((ticket) =>
        (ticket.purchase?.orders || []).map((order) => ({
          name: order.menuItem.name,
          quantity: 1,
          price: Number(order.menuItem.price) / 100,
          options: order.choices.map((choice) => ({
            name: choice.option.name,
            choice: choice.selectedChoice.name,
          })),
        }))
      ),
    }

    // Generate and send confirmation email to customer
    const emailHtml = generateTicketConfirmationEmail(emailData)
    await sendEmail({
      to: tickets[0].user?.email || '',
      subject: `Your tickets for ${tickets[0].campaign.movieTitle}`,
      html: emailHtml,
    })

    return { received: true }
  } catch (error) {
    console.error('Error processing payment:', error)
    return {
      received: false,
      error: 'Error processing payment',
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
  orders: Array<{
    menuItem: {
      name: string
      price: number | Prisma.Decimal
    }
    choices: Array<{
      optionId: string
      selectedChoice: string
    }>
  }>
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
      const ordersList = ticket.orders
        .map((order) => {
          const choices = order.choices
            .map((choice) => `${choice.selectedChoice} (${choice.optionId})`)
            .join(', ')

          return `
            <li>
              ${order.menuItem.name}${choices ? ` - ${choices}` : ''}
              (${formatPrice(order.menuItem.price)})
            </li>
          `
        })
        .join('')

      return `
        <div style="margin-bottom: 20px;">
          <h3>Ticket #${ticket.id}</h3>
          ${ordersList ? `<h4>Orders:</h4><ul>${ordersList}</ul>` : ''}
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
