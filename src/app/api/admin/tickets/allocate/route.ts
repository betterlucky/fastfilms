import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { ticketId, userId } = await request.json()

    if (!ticketId || !userId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Find the ticket and verify it's a pay-it-forward ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { campaign: true }
    })

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 })
    }

    if (ticket.status !== "PAY_IT_FORWARD") {
      return new NextResponse("This is not a pay-it-forward ticket", { status: 400 })
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Update the ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        userId: userId,
        status: "CONFIRMED"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        campaign: {
          select: {
            title: true,
            movieTitle: true,
            screeningDate: true
          }
        }
      }
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error('Error allocating ticket:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 