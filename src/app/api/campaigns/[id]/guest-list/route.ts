import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { generateVenueGuestListEmail } from '@/lib/email'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
          },
        },
        tickets: {
          where: { status: 'CONFIRMED' },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            orders: {
              include: {
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
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
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (!campaign.venue.contactEmail) {
      return NextResponse.json(
        { error: 'Venue contact email not set' },
        { status: 400 }
      )
    }

    // Group tickets by user to create guest list
    const guestList = campaign.tickets.reduce(
      (acc, ticket) => {
        const existingGuest = acc.find((g) => g.email === ticket.user.email)
        if (existingGuest) {
          existingGuest.ticketCount += 1
          existingGuest.foodOrders.push(
            ...ticket.orders.map((order) => ({
              itemName: order.menuItem.name,
              quantity: order.quantity,
              options: order.choices.map((choice) => ({
                optionName: choice.option?.name || '',
                choice: choice.selectedChoice?.name || '',
              })),
            }))
          )
        } else {
          acc.push({
            name: ticket.user.name || 'Guest',
            email: ticket.user.email,
            ticketCount: 1,
            foodOrders: ticket.orders.map((order) => ({
              itemName: order.menuItem.name,
              quantity: order.quantity,
              options: order.choices.map((choice) => ({
                optionName: choice.option?.name || '',
                choice: choice.selectedChoice?.name || '',
              })),
            })),
          })
        }
        return acc
      },
      [] as Array<{
        name: string | null
        email: string
        ticketCount: number
        foodOrders: Array<{
          itemName: string
          quantity: number
          options: Array<{
            optionName: string
            choice: string
          }>
        }>
      }>
    )

    const emailHtml = generateVenueGuestListEmail({
      movieTitle: campaign.movieTitle,
      venueName: campaign.venue.name,
      screeningDate: campaign.screeningDate,
      screeningTime: campaign.screeningTime,
      totalTickets: campaign.tickets.length,
      guestList,
    })

    await sendEmail({
      to: campaign.venue.contactEmail,
      subject: `Guest List and Food Orders - ${campaign.movieTitle}`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending guest list:', error)
    return NextResponse.json(
      { error: 'Failed to send guest list' },
      { status: 500 }
    )
  }
}
