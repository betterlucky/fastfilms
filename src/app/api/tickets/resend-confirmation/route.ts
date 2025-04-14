import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { generateTicketConfirmationEmail } from '@/lib/email'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EmailData } from '@/lib/types'
import { settings } from '@/lib/settings'

// Rate limiting: 1 email per 5 minutes
const RESEND_COOLDOWN = 5 * 60 * 1000 // 5 minutes in milliseconds

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ticketIds } = await request.json()
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing ticket IDs' },
        { status: 400 }
      )
    }

    // Get the first ticket to find the purchase
    const firstTicket = await prisma.ticket.findFirst({
      where: { id: { in: ticketIds } },
      include: {
        purchase: true,
      },
    })

    if (!firstTicket || !firstTicket.purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      )
    }

    // Get all tickets from the same purchase
    const purchaseTickets = await prisma.ticket.findMany({
      where: {
        purchaseId: firstTicket.purchaseId,
      },
      include: {
        campaign: {
          include: {
            venue: true,
          },
        },
        purchase: {
          include: {
            orders: {
              include: {
                menuItem: true,
                choices: {
                  include: {
                    option: true,
                    selectedChoices: true,
                  },
                },
              },
            },
          },
        },
        user: true,
      },
    })

    // Prepare email data
    const emailData: EmailData = {
      movieTitle: purchaseTickets[0].campaign.movieTitle,
      venueName: purchaseTickets[0].campaign.venue.name,
      screeningDate: purchaseTickets[0].campaign.screeningDate,
      ticketQuantity: purchaseTickets.length,
      totalAmount: Number(firstTicket.purchase.totalAmount),
      regularTickets: purchaseTickets.filter(t => t.status === 'CONFIRMED').length,
      pifTickets: purchaseTickets.filter(t => t.status === 'PAY_IT_FORWARD').length,
      ticketPrice: Number(purchaseTickets.find(t => t.status === 'CONFIRMED')?.pricePaid || settings.minimumTicketPrice),
      foodOrders: purchaseTickets[0].purchase.orders.map(order => ({
        name: order.menuItem.name,
        quantity: order.quantity,
        price: Number(order.menuItem.price),
        options: order.choices.map(choice => ({
          name: choice.option.name,
          choice: choice.selectedChoices.map(c => c.name).join(', ')
        })),
      })),
    }

    // Generate and send email
    const emailHtml = generateTicketConfirmationEmail(emailData)
    const emailSent = await sendEmail({
      to: purchaseTickets[0].user.email,
      subject: `Your tickets for ${purchaseTickets[0].campaign.movieTitle}`,
      html: emailHtml,
    })

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resending confirmation:', error)
    return NextResponse.json(
      { error: 'Failed to resend confirmation' },
      { status: 500 }
    )
  }
} 