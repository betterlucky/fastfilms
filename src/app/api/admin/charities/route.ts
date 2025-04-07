import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const url = formData.get("url") as string
    const logoPath = formData.get("logoUrl") as string || null

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Charity name is required" }, { status: 400 })
    }

    try {
      const charity = await prisma.charity.create({
        data: {
          name,
          description,
          url,
          logoPath,
        },
      })
      return NextResponse.json(charity)
    } catch (dbError) {
      console.error("Database error creating charity:", dbError)
      return NextResponse.json({ error: "Failed to save charity to database" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating charity:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to create charity" 
    }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const charities = await prisma.charity.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(charities)
  } catch (error) {
    console.error("Error fetching charities:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 