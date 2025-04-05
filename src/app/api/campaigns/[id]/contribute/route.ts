import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid contribution amount" },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    if (campaign.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Campaign is not active" },
        { status: 400 }
      )
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        currentFunding: {
          increment: amount,
        },
      },
    })

    // Create contribution record
    await (prisma as any).contribution.create({
      data: {
        amount: Number(amount),
        campaignId: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(updatedCampaign)
  } catch (error) {
    console.error("Error processing contribution:", error)
    return NextResponse.json(
      { error: "Failed to process contribution" },
      { status: 500 }
    )
  }
} 