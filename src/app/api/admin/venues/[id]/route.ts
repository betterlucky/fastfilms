import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const venueSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postcode: z.string().min(1),
  phone: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  contactEmail: z.array(z.string().email()).default([]),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
  })

  return NextResponse.json(venue)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const json = await request.json()
    const body = venueSchema.parse(json)

    const venue = await prisma.venue.update({
      where: { id: params.id },
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        postcode: body.postcode,
        phone: body.phone || null,
        url: body.url || null,
        contactEmail: body.contactEmail || [],
      } as unknown as Prisma.VenueUpdateInput,
    })

    return NextResponse.json(venue)
  } catch (error) {
    console.error('Error updating venue:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Check if venue exists and has any active campaigns
    const venue = await prisma.venue.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            campaigns: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
        menuItems: {
          include: {
            campaigns: true,
            options: {
              include: {
                choices: true,
              },
            },
          },
        },
        screens: {
          include: {
            campaigns: true,
          },
        },
      },
    })

    if (!venue) {
      return new NextResponse('Venue not found', { status: 404 })
    }

    if (venue._count.campaigns > 0) {
      return new NextResponse(
        'Cannot delete venue with active campaigns',
        { status: 400 }
      )
    }

    // Delete all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all menu items and their related data
      for (const menuItem of venue.menuItems) {
        // Delete campaign menu item references
        await tx.campaignMenuItem.deleteMany({
          where: {
            menuItemId: menuItem.id,
          },
        })

        // Delete menu item option choices
        await tx.menuItemOptionChoice.deleteMany({
          where: {
            option: {
              menuItemId: menuItem.id,
            },
          },
        })

        // Delete menu item options
        await tx.menuItemOption.deleteMany({
          where: {
            menuItemId: menuItem.id,
          },
        })

        // Delete the menu item
        await tx.menuItem.delete({
          where: { id: menuItem.id },
        })
      }

      // Delete all screens and their related data
      for (const screen of venue.screens) {
        // Delete screen campaigns
        await tx.campaign.deleteMany({
          where: { screenId: screen.id },
        })

        // Delete the screen
        await tx.screen.delete({
          where: { id: screen.id },
        })
      }

      // Finally delete the venue
      await tx.venue.delete({
        where: { id: params.id },
      })
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting venue:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
