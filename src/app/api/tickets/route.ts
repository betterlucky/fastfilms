import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        userId: session.user.id,
        status: "CONFIRMED",
      },
      include: {
        campaign: {
          include: {
            venue: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Error fetching tickets:", error)
    // Even on error, return empty array to show "no tickets" state
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await request.json()
    const { campaignId, quantity, menuItems } = data

    // Get campaign to check if it's in test mode
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { isTest: true }
    })

    if (!campaign) {
      return new NextResponse("Campaign not found", { status: 404 })
    }

    // Create tickets
    const tickets = await prisma.ticket.createMany({
      data: Array(quantity).fill({
        campaignId,
        userId: session.user.id,
        pricePaid: 0, // Set price to 0 for test mode
        status: campaign.isTest ? "CONFIRMED" : "PENDING"
      })
    })

    // Create menu item orders if provided
    if (menuItems && menuItems.length > 0) {
      const createdTickets = await prisma.ticket.findMany({
        where: {
          campaignId,
          userId: session.user.id,
          status: campaign.isTest ? "CONFIRMED" : "PENDING"
        },
        orderBy: {
          createdAt: "desc"
        },
        take: quantity
      })

      for (const ticket of createdTickets) {
        for (const item of menuItems) {
          await prisma.order.create({
            data: {
              ticketId: ticket.id,
              menuItemId: item.id,
              quantity: item.quantity
            }
          })
        }
      }
    }

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Error creating tickets:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 