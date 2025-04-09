import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      title,
      description,
      movieTitle,
      venueId,
      screenId,
      screeningDate,
      deadlineDate,
      ticketCap,
      fundingTarget,
      charityId,
      menuItemIds,
      isFeatured,
      status,
      isTest,
    } = body

    // Format the time from the screeningDate
    const screeningTime = new Date(screeningDate).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    // Update campaign
    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        title,
        description,
        movieTitle,
        venueId,
        screenId: screenId === 'unassign' ? null : screenId,
        screeningDate: new Date(screeningDate),
        screeningTime,
        deadlineDate: new Date(deadlineDate),
        ticketCap,
        fundingTarget,
        charityId: charityId === 'none' ? null : charityId,
        isFeatured,
        status,
        isTest,
      },
    })

    // Update menu items
    await prisma.campaignMenuItem.deleteMany({
      where: { campaignId: params.id },
    })

    if (menuItemIds?.length > 0) {
      await prisma.campaignMenuItem.createMany({
        data: menuItemIds.map((menuItemId: string) => ({
          campaignId: params.id,
          menuItemId,
        })),
      })
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error updating campaign:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // First check if campaign exists and has any active tickets
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            tickets: {
              where: {
                status: {
                  not: 'CANCELLED',
                },
              },
            },
          },
        },
      },
    })

    if (!campaign) {
      return new NextResponse('Campaign not found', { status: 404 })
    }

    if (campaign._count.tickets > 0) {
      return new NextResponse(
        'Cannot delete campaign with active tickets. Please handle ticket transfers or refunds first.',
        { status: 400 }
      )
    }

    // If no active tickets, proceed with deletion in correct order
    await prisma.$transaction(async (tx) => {
      // 1. Delete CampaignMenuItem records
      await tx.campaignMenuItem.deleteMany({
        where: { campaignId: params.id },
      })

      // 2. Delete Comment records (including nested replies)
      await tx.comment.deleteMany({
        where: { campaignId: params.id },
      })

      // 3. Delete Order records associated with campaign tickets
      await tx.order.deleteMany({
        where: {
          purchase: {
            campaignId: params.id,
          },
        },
      })

      // 4. Delete Ticket records (should only be cancelled ones at this point)
      await tx.ticket.deleteMany({
        where: { campaignId: params.id },
      })

      // 5. Finally delete the campaign
      await tx.campaign.delete({
        where: { id: params.id },
      })
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
