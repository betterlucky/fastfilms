import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
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