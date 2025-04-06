import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

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
    const logoFile = formData.get("logo") as File | null

    let logoPath = null
    if (logoFile) {
      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), "public/uploads/charities")
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Generate a unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const path = join(uploadsDir, filename)

      // Save the file
      const bytes = await logoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(path, buffer)
      logoPath = `/uploads/charities/${filename}`
    }

    const charity = await prisma.charity.create({
      data: {
        name,
        description,
        url,
        logoPath,
      },
    })

    return NextResponse.json(charity)
  } catch (error) {
    console.error("Error creating charity:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
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