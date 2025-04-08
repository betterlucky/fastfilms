import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TicketStatus } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        userId: session.user.id,
        status: TicketStatus.CONFIRMED,
      },
      include: {
        campaign: {
          select: {
            id: true,
            movieTitle: true,
            screeningDate: true,
            screeningTime: true,
            venue: {
              select: {
                name: true,
              },
            },
          },
        },
        purchase: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform the data to combine date and time
    const transformedTickets = tickets.map(ticket => {
      const screeningDate = new Date(ticket.campaign.screeningDate)
      const [hours, minutes] = ticket.campaign.screeningTime.split(':')
      screeningDate.setHours(parseInt(hours), parseInt(minutes))

      return {
        ...ticket,
        screeningDate: screeningDate.toISOString(),
        stripePaymentIntentId: ticket.purchase?.stripePaymentIntentId || null
      }
    })

    return NextResponse.json(transformedTickets)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    // Even on error, return empty array to show "no tickets" state
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    const { campaignId, quantity, menuItems } = data

    // Get campaign to check if it's in test mode
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { isTest: true },
    })

    if (!campaign) {
      return new NextResponse('Campaign not found', { status: 404 })
    }

    // Create tickets
    const tickets = await prisma.ticket.createMany({
      data: Array(quantity).fill({
        campaignId,
        userId: session.user.id,
        pricePaid: 0, // Set price to 0 for test mode
        status: campaign.isTest ? TicketStatus.CONFIRMED : TicketStatus.PENDING,
      }),
    })

    // Create menu item orders if provided
    if (menuItems && menuItems.length > 0) {
      // First create a purchase record
      const purchase = await prisma.purchase.create({
        data: {
          campaignId,
          userId: session.user.id,
          status: campaign.isTest ? TicketStatus.CONFIRMED : TicketStatus.PENDING,
          totalAmount: 0, // Set to 0 for test mode
        }
      })

      // Get the created tickets and link them to the purchase
      const createdTickets = await prisma.ticket.findMany({
        where: {
          campaignId,
          userId: session.user.id,
          status: campaign.isTest ? TicketStatus.CONFIRMED : TicketStatus.PENDING,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: quantity,
      })

      // Update tickets with purchaseId
      await prisma.ticket.updateMany({
        where: {
          id: {
            in: createdTickets.map(t => t.id)
          }
        },
        data: {
          purchaseId: purchase.id
        }
      })

      // Create orders linked to the purchase
      for (const item of menuItems) {
        await prisma.order.create({
          data: {
            purchaseId: purchase.id,
            menuItemId: item.id,
            quantity: item.quantity,
          },
        })
      }
    }

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error creating tickets:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
