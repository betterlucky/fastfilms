import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { generateTicketConfirmationEmail } from '@/lib/email'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EmailData } from '@/lib/types'

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

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
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

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check if user is authorized (either admin or ticket owner)
    if (session.user.role !== 'ADMIN' && ticket.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if we have a last resend timestamp
    const lastResend = await prisma.ticketResend.findFirst({
      where: { ticketId: ticket.id },
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

    // Transform ticket data for email
    const emailData: EmailData = {
      movieTitle: ticket.campaign.movieTitle,
      venueName: ticket.campaign.venue.name,
      screeningDate: ticket.campaign.screeningDate,
      ticketQuantity: 1,
      totalAmount: Number(ticket.pricePaid) / 100,
      regularTickets: ticket.status === 'CONFIRMED' ? 1 : 0,
      pifTickets: ticket.status === 'PAY_IT_FORWARD' ? 1 : 0,
      foodOrders: ticket.orders.map(order => ({
        name: order.menuItem.name,
        quantity: 1,
        price: Number(order.menuItem.price) / 100,
        options: order.choices.map(choice => ({
          name: choice.option.name,
          choice: choice.selectedChoice.name
        }))
      }))
    }

    // Send email
    const emailHtml = generateTicketConfirmationEmail(emailData)
    await sendEmail({
      to: ticket.user?.email || '',
      subject: `Your ticket for ${ticket.campaign.movieTitle}`,
      html: emailHtml,
    })

    // Record the resend
    await prisma.ticketResend.create({
      data: {
        ticketId: ticket.id,
        userId: session.user.id,
      },
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