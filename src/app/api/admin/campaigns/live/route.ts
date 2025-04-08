import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'UPCOMING'],
        },
      },
      select: {
        id: true,
        title: true,
        screeningDate: true,
        venue: {
          select: {
            name: true,
            contactEmail: true,
          },
        },
      },
      orderBy: {
        screeningDate: 'asc',
      },
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Error fetching live campaigns:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
