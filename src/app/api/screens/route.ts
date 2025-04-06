import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, capacity, venueId } = await request.json()

    if (!name || !capacity || !venueId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Create screen using raw SQL
    const [screen] = await prisma.$queryRaw<Array<{ id: string; name: string; capacity: number; venueId: string }>>`
      INSERT INTO "Screen" (id, name, capacity, "venueId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${name}, ${capacity}, ${venueId}, NOW(), NOW())
      RETURNING id, name, capacity, "venueId"
    `;

    return NextResponse.json(screen)
  } catch (error) {
    console.error("Error creating screen:", error)
    return NextResponse.json(
      { error: "Failed to create screen" },
      { status: 500 }
    )
  }
} 