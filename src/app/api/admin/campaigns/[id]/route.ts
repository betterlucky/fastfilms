import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      title,
      description,
      movieTitle,
      customBlurb,
      venueId,
      screenId,
      screeningDate,
      screeningTime,
      deadlineDate,
      ticketCap,
      fundingTarget,
      charityId,
      menuItemIds,
      isFeatured
    } = body

    // Update campaign
    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        title,
        description,
        movieTitle,
        customBlurb,
        venueId,
        screenId,
        screeningDate: new Date(screeningDate),
        screeningTime,
        deadlineDate: new Date(deadlineDate),
        ticketCap,
        fundingTarget,
        charityId,
        isFeatured,
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
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Check if campaign exists and has any confirmed tickets
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            tickets: {
              where: {
                status: "CONFIRMED"
              }
            }
          }
        }
      }
    })

    if (!campaign) {
      return new NextResponse("Campaign not found", { status: 404 })
    }

    if (campaign._count.tickets > 0) {
      return new NextResponse(
        "Cannot delete campaign with confirmed tickets",
        { status: 400 }
      )
    }

    // Delete the campaign
    await prisma.campaign.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting campaign:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 