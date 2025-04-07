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
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  await prisma.venue.delete({
    where: { id: params.id },
  })

  return new NextResponse("Venue deleted", { status: 200 })
} 