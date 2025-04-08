import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const campaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  movieTitle: z.string().min(1),
  customBlurb: z.string().optional(),
  venueId: z.string().min(1),
  screenId: z.string().nullable(),
  screeningDate: z.string().or(z.date()),
  screeningTime: z.string(),
  deadlineDate: z.string().or(z.date()),
  ticketCap: z.number().min(0),
  fundingTarget: z.number().min(0),
  charityId: z.string().nullable(),
  menuItemIds: z.array(z.string()),
  isFeatured: z.boolean(),
  isTest: z.boolean(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const json = await request.json()
    const body = campaignSchema.parse(json)

    const campaign = await prisma.campaign.create({
      data: {
        title: body.title,
        description: body.description,
        movieTitle: body.movieTitle,
        customBlurb: body.customBlurb,
        venueId: body.venueId,
        screenId: body.screenId,
        screeningDate: new Date(body.screeningDate),
        screeningTime: body.screeningTime,
        deadlineDate: new Date(body.deadlineDate),
        ticketCap: body.ticketCap,
        fundingTarget: body.fundingTarget,
        charityId: body.charityId,
        isFeatured: body.isFeatured,
        isTest: body.isTest,
        menuItems: {
          create: body.menuItemIds.map((menuItemId) => ({
            menuItemId,
          })),
        },
      },
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('[CAMPAIGNS_POST]', error)
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 })
    }
    return new NextResponse('Internal error', { status: 500 })
  }
}
