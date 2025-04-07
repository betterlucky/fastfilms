import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const venueSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postcode: z.string().min(1),
  phone: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
  })

  return NextResponse.json(venue)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, address, city, postcode, phone, url, contactEmail } = body

    const venue = await prisma.venue.update({
      where: { id: params.id },
      data: {
        name,
        address,
        city,
        postcode,
        phone,
        url,
        contactEmail,
      },
    })

    return NextResponse.json(venue)
  } catch (error) {
    console.error("Error updating venue:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Check if venue exists and has any active campaigns
    const venue = await prisma.venue.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            campaigns: {
              where: {
                status: "ACTIVE"
              }
            }
          }
        }
      }
    })

    if (!venue) {
      return new NextResponse("Venue not found", { status: 404 })
    }

    if (venue._count.campaigns > 0) {
      return new NextResponse(
        "Cannot delete venue with active campaigns",
        { status: 400 }
      )
    }

    // Delete the venue
    await prisma.venue.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting venue:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 