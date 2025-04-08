import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; menuItemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, verify the menu item belongs to the venue
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.menuItemId },
      include: {
        campaigns: true,
      },
    })

    if (!menuItem || menuItem.venueId !== params.id) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    // Check if the menu item is used in any active campaigns
    const activeCampaigns = await prisma.campaign.count({
      where: {
        menuItems: {
          some: {
            menuItemId: params.menuItemId,
          },
        },
        status: 'ACTIVE',
      },
    })

    if (activeCampaigns > 0) {
      return NextResponse.json(
        { error: 'Cannot delete menu item that is used in active campaigns' },
        { status: 400 }
      )
    }

    // Delete in this order:
    // 1. Campaign menu item references
    // 2. Menu item option choices
    // 3. Menu item options
    // 4. Menu item itself
    await prisma.$transaction([
      // Delete campaign menu item references
      prisma.campaignMenuItem.deleteMany({
        where: {
          menuItemId: params.menuItemId,
        },
      }),
      // Delete menu item option choices
      prisma.menuItemOptionChoice.deleteMany({
        where: {
          option: {
            menuItemId: params.menuItemId,
          },
        },
      }),
      // Delete menu item options
      prisma.menuItemOption.deleteMany({
        where: {
          menuItemId: params.menuItemId,
        },
      }),
      // Finally delete the menu item
      prisma.menuItem.delete({
        where: {
          id: params.menuItemId,
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    )
  }
}
