import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Find all test campaigns
    const testCampaigns = await prisma.campaign.findMany({
      where: {
        isTest: true,
      },
      select: {
        id: true,
      },
    })

    if (testCampaigns.length === 0) {
      return NextResponse.json({
        message: 'No test campaigns found',
        campaignsDeleted: 0,
        statistics: {
          tickets: 0,
          purchases: 0,
          orders: 0,
          orderChoices: 0,
          menuItems: 0,
        },
      })
    }

    // Get counts of associated records before deletion
    const campaignIds = testCampaigns.map(c => c.id)
    
    const [ticketsCount, purchasesCount, ordersCount, orderChoicesCount, menuItemsCount] = await Promise.all([
      prisma.ticket.count({ where: { campaignId: { in: campaignIds } } }),
      prisma.purchase.count({ where: { campaignId: { in: campaignIds } } }),
      prisma.order.count({ 
        where: { 
          purchase: {
            campaignId: { in: campaignIds }
          }
        } 
      }),
      prisma.orderChoice.count({
        where: {
          order: {
            purchase: {
              campaignId: { in: campaignIds }
            }
          }
        }
      }),
      prisma.campaignMenuItem.count({ where: { campaignId: { in: campaignIds } } }),
    ])

    // Delete all associated data for test campaigns
    // This will cascade delete tickets, purchases, orders, etc.
    const result = await prisma.campaign.deleteMany({
      where: {
        isTest: true,
      },
    })

    return NextResponse.json({
      message: `Successfully deleted ${result.count} test campaigns and their associated data`,
      campaignsDeleted: result.count,
      statistics: {
        tickets: ticketsCount,
        purchases: purchasesCount,
        orders: ordersCount,
        orderChoices: orderChoicesCount,
        menuItems: menuItemsCount,
      },
    })
  } catch (error) {
    console.error('Error cleaning up test campaigns:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 