import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const venueSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postcode: z.string().min(1),
  phone: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  contactEmail: z.array(z.string().email()).default([]),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const body = venueSchema.parse(json)

    // Create venue with all fields
    const venue = await prisma.venue.create({
      data: {
        name: body.name,
        address: body.address,
        city: body.city,
        postcode: body.postcode,
        phone: body.phone || null,
        url: body.url || null,
        contactEmail: body.contactEmail,
      },
    })

    return NextResponse.json(venue)
  } catch (error) {
    console.error("[VENUES_POST]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 