import { prisma } from '@/lib/db'
import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get campaign ID from URL
    const campaignId = request.url.split('/').pop()
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid contribution amount' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      )
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        currentFunding: {
          increment: amount,
        },
      },
    })

    return NextResponse.json(updatedCampaign)
  } catch (error) {
    console.error('Error processing contribution:', error)
    return NextResponse.json(
      { error: 'Failed to process contribution' },
      { status: 500 }
    )
  }
}
