import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        createdAt: true,
        totalAmount: true,
        status: true,
        campaign: {
          select: {
            id: true,
            movieTitle: true,
            screeningDate: true,
            venue: {
              select: {
                name: true,
              },
            },
          },
        },
        tickets: {
          select: {
            id: true,
            status: true,
            pricePaid: true,
          },
        },
        orders: {
          select: {
            id: true,
            quantity: true,
            menuItem: {
              select: {
                name: true,
                price: true,
              },
            },
            choices: {
              select: {
                selectedChoices: {
                  select: {
                    name: true,
                    priceAdjustment: true,
                  },
                },
                option: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
} 