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
        campaign: {
          include: {
            venue: true
          }
        },
        purchase: {
          include: {
            orders: {
              include: {
                menuItem: true,
                choices: {
                  include: {
                    option: true,
                    selectedChoice: true
                  }
                }
              }
            }
          }
        },
        user: true
      }
    })

    if (!targetTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Get all tickets from the same purchase
    const tickets = await prisma.ticket.findMany({
      where: {
        purchaseId: targetTicket.purchaseId
      },
      include: {
        campaign: {
          include: {
            venue: true
          }
        }
      }
    })

    // Prepare email data
    const emailData: EmailData = {
      movieTitle: targetTicket.campaign.movieTitle,
      venueName: targetTicket.campaign.venue.name,
      screeningDate: targetTicket.campaign.screeningDate,
      ticketQuantity: tickets.length,
      totalAmount: Number(targetTicket.purchase.totalAmount),
      regularTickets: tickets.filter(t => t.status === 'CONFIRMED').length,
      pifTickets: tickets.filter(t => t.status === 'PAY_IT_FORWARD').length,
      foodOrders: targetTicket.purchase.orders.map(order => ({
        name: order.menuItem.name,
        quantity: order.quantity,
        price: Number(order.menuItem.price),
        options: order.choices.map(choice => ({
          name: choice.option.name,
          choice: choice.selectedChoice.name
        }))
      }))
    }

    // Generate and send email
    const emailHtml = generateTicketConfirmationEmail(emailData)
    const emailSent = await sendEmail({
      to: targetTicket.user.email,
      subject: `Your tickets for ${targetTicket.campaign.movieTitle}`,
      html: emailHtml
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
