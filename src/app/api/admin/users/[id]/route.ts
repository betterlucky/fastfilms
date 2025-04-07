import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import { UserRole } from "@prisma/client"

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  isAdmin: z.boolean(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await request.json()
    const body = userSchema.parse(json)

    const user = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        name: body.name,
        email: body.email,
        role: body.isAdmin ? UserRole.ADMIN : UserRole.CUSTOMER,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USERS_PATCH]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 