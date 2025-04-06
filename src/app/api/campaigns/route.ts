import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.description || !data.venueId || !data.screeningDate || !data.deadlineDate || !data.fundingTarget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate dates
    const screeningDate = new Date(data.screeningDate)
    const deadlineDate = new Date(data.deadlineDate)
    const now = new Date()

    if (deadlineDate <= now) {
      return NextResponse.json(
        { error: "Deadline date must be in the future" },
        { status: 400 }
      )
    }

    if (screeningDate <= deadlineDate) {
      return NextResponse.json(
        { error: "Screening date must be after the deadline date" },
        { status: 400 }
      )
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        title: data.title,
        description: data.description,
        movieTitle: data.movieTitle,
        venueId: data.venueId,
        screeningDate: screeningDate,
        deadlineDate: deadlineDate,
        fundingTarget: data.fundingTarget,
        currentFunding: 0,
        status: "ACTIVE",
        tmdbId: data.tmdbId || null,
        posterPath: data.posterPath || null,
      },
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    )
  }
} 