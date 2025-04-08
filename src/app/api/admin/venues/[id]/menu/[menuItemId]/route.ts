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
    })

    if (!menuItem || menuItem.venueId !== params.id) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    // Delete the menu item (cascade will handle related records)
    await prisma.menuItem.delete({
      where: { id: params.menuItemId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    )
  }
} 