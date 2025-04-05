import { getServerSession } from "next-auth"
import { NextResponse, type NextRequest } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, address, city, postcode } = await request.json()

    if (!name || !address || !city || !postcode) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const venue = await prisma.venue.create({
      data: {
        name,
        address,
        city,
        postcode,
      },
    })

    return NextResponse.json(venue)
  } catch (error) {
    console.error("Error creating venue:", error)
    return NextResponse.json(
      { error: "Failed to create venue" },
      { status: 500 }
    )
  }
} 