import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const menuItemSchema = z.object({
  id: z.string(),
  price: z.number().min(0),
})

const campaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  movieTitle: z.string().min(1),
  venueId: z.string().min(1),
  screeningDate: z.string().or(z.date()),
  ticketCap: z.number().min(0),
  fundingTarget: z.number().min(0),
  deadlineDate: z.string().or(z.date()),
  posterPath: z.string().nullable().optional(),
  screenId: z.string().nullable().optional(),
  charityId: z.string().nullable().optional(),
  customBlurb: z.string().nullable().optional(),
  tmdbId: z.string().nullable().optional(),
  isTest: z.boolean().optional(),
  menuItems: z.array(menuItemSchema).optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const json = await request.json()
    const validatedData = campaignSchema.parse(json)

    const campaign = await prisma.campaign.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        movieTitle: validatedData.movieTitle,
        venueId: validatedData.venueId,
        screeningDate: new Date(validatedData.screeningDate),
        ticketCap: validatedData.ticketCap,
        fundingTarget: validatedData.fundingTarget,
        deadlineDate: new Date(validatedData.deadlineDate),
        posterPath: validatedData.posterPath,
        screenId: validatedData.screenId,
        charityId: validatedData.charityId,
        customBlurb: validatedData.customBlurb,
        tmdbId: validatedData.tmdbId,
        isTest: validatedData.isTest ?? false,
        menuItems: validatedData.menuItems ? {
          create: validatedData.menuItems.map((item) => ({
            menuItemId: item.id,
          })),
        } : undefined,
      },
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('[CAMPAIGNS_POST]', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
