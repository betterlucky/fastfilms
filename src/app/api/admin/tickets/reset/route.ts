import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { ticketId } = await request.json()

    if (!ticketId) {
      return new NextResponse('Ticket ID is required', { status: 400 })
    }

    // Find the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { campaign: true },
    })

    if (!ticket) {
      return new NextResponse('Ticket not found', { status: 404 })
    }

    // Update the ticket back to PAY_IT_FORWARD status
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'PAY_IT_FORWARD',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        campaign: {
          select: {
            title: true,
            movieTitle: true,
            screeningDate: true,
          },
        },
      },
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error('Error resetting ticket:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
