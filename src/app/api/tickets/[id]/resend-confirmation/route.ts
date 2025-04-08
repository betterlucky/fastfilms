import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { generateTicketConfirmationEmail } from '@/lib/email'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EmailData } from '@/lib/types'
import { Prisma } from '@prisma/client'

// Rate limiting: 1 email per 5 minutes
const RESEND_COOLDOWN = 5 * 60 * 1000 // 5 minutes in milliseconds

// Define the type for our ticket query result
type TicketWithRelations = Prisma.TicketGetPayload<{
  include: {
    campaign: {
      include: {
        venue: {
          select: {
            id: true
            name: true
          }
        }
      }
    }
    purchase: {
      include: {
        orders: {
          include: {
            menuItem: true
            choices: {
              include: {
                option: { select: { name: true } }
                selectedChoice: { select: { name: true } }
              }
            }
          }
        }
      }
    }
    user: {
      select: {
        name: true
        email: true
      }
    }
  }
}>

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the target ticket and find all related tickets in the same transaction
    const targetTicket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        campaign: true,
        purchase: {
          select: {
            id: true,
            stripePaymentIntentId: true
          }
        },
      }
    })

    if (!targetTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Get all tickets from the same transaction
    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [
          // If it's a Stripe transaction, get all tickets with same payment intent
          {
            purchase: {
              stripePaymentIntentId: targetTicket.purchase.stripePaymentIntentId,
              NOT: { stripePaymentIntentId: null }
            }
          },
          // If it's a test transaction, get tickets created at the same time
          {
            AND: [
              { campaignId: targetTicket.campaignId },
              { userId: targetTicket.userId },
              {
                createdAt: {
                  gte: new Date(targetTicket.createdAt.getTime() - 1000), // Within 1 second
                  lte: new Date(targetTicket.createdAt.getTime() + 1000)
                }
              }
            ]
          }
        ]
      },
      include: {
        campaign: {
          include: {
            venue: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        purchase: {
          include: {
            orders: {
              include: {
                menuItem: true,
                choices: {
                  include: {
                    option: { select: { name: true } },
                    selectedChoice: { select: { name: true } }
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    }) as TicketWithRelations[]

    if (!tickets.length) {
      return NextResponse.json(
        { error: 'No tickets found for this transaction' },
        { status: 404 }
      )
    }

    // Check if user is authorized (either admin or ticket owner)
    if (session.user.role !== 'ADMIN' && tickets[0]?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if we have a last resend timestamp
    const lastResend = await prisma.ticketResend.findFirst({
      where: { ticketId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    // If not admin, check cooldown
    if (session.user.role !== 'ADMIN' && lastResend) {
      const timeSinceLastResend = Date.now() - lastResend.createdAt.getTime()
      if (timeSinceLastResend < RESEND_COOLDOWN) {
        const remainingMinutes = Math.ceil((RESEND_COOLDOWN - timeSinceLastResend) / (60 * 1000))
        return NextResponse.json(
          { error: `Please wait ${remainingMinutes} minutes before requesting another resend` },
          { status: 429 }
        )
      }
    }

    // Calculate total amount including tickets and food
    const ticketsTotal = tickets.reduce((sum, t) => sum + Number(t.pricePaid), 0)
    const foodTotal = tickets.reduce((sum, t) => 
      sum + (t.purchase?.orders || []).reduce((orderSum, o) => 
        orderSum + (Number(o.menuItem.price) * o.quantity), 0
      ), 0
    )

    // Group food orders by menu item
    const foodOrdersMap = new Map()
    tickets.forEach(ticket => {
      if (ticket.purchase) {
        ticket.purchase.orders.forEach(order => {
          const key = order.menuItem.id
          if (!foodOrdersMap.has(key)) {
            foodOrdersMap.set(key, {
              name: order.menuItem.name,
              quantity: 0,
              price: Number(order.menuItem.price) / 100,
              options: order.choices.map(choice => ({
                name: choice.option.name,
                choice: choice.selectedChoice.name
              }))
            })
          }
          const item = foodOrdersMap.get(key)
          item.quantity += order.quantity
        })
      }
    })

    // Transform ticket data for email
    const emailData: EmailData = {
      movieTitle: tickets[0].campaign.movieTitle,
      venueName: tickets[0].campaign.venue.name,
      screeningDate: tickets[0].campaign.screeningDate,
      ticketQuantity: tickets.length,
      totalAmount: (ticketsTotal + foodTotal) / 100,
      regularTickets: tickets.filter(t => t.status === 'CONFIRMED').length,
      pifTickets: tickets.filter(t => t.status === 'PAY_IT_FORWARD').length,
      foodOrders: Array.from(foodOrdersMap.values())
    }

    // Ensure we have a valid email address
    const recipientEmail = tickets[0].user?.email
    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'No email address found for ticket holder' },
        { status: 400 }
      )
    }

    // Send email
    const emailHtml = generateTicketConfirmationEmail(emailData)
    await sendEmail({
      to: recipientEmail,
      subject: `Your tickets for ${tickets[0].campaign.movieTitle}`,
      html: emailHtml,
    })

    // Record the resend for all tickets in the group
    await prisma.ticketResend.createMany({
      data: tickets.map(t => ({
        ticketId: t.id,
        userId: session.user.id
      }))
    })

    return NextResponse.json({ message: 'Confirmation email resent successfully' })
  } catch (error) {
    console.error('Error resending confirmation email:', error)
    return NextResponse.json(
      { error: 'Failed to resend confirmation email' },
      { status: 500 }
    )
  }
} 