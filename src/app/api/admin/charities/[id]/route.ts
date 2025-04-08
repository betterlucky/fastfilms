import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const charity = await prisma.charity.findUnique({
      where: { id: params.id },
    })

    if (!charity) {
      return new NextResponse('Charity not found', { status: 404 })
    }

    return NextResponse.json(charity)
  } catch (error) {
    console.error('Error fetching charity:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const formData = await req.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const url = formData.get('url') as string
    const logoFile = formData.get('logo') as File | null

    const existingCharity = await prisma.charity.findUnique({
      where: { id: params.id },
    })

    if (!existingCharity) {
      return new NextResponse('Charity not found', { status: 404 })
    }

    let logoPath = existingCharity.logoPath
    if (logoFile) {
      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'public/uploads/charities')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Delete old logo if it exists
      if (existingCharity.logoPath) {
        const oldPath = join(process.cwd(), 'public', existingCharity.logoPath)
        try {
          await unlink(oldPath)
        } catch (error) {
          console.error('Error deleting old logo:', error)
        }
      }

      // Save new logo
      const timestamp = Date.now()
      const filename = `${timestamp}-${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const path = join(uploadsDir, filename)
      const bytes = await logoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(path, buffer)
      logoPath = `/uploads/charities/${filename}`
    }

    const charity = await prisma.charity.update({
      where: { id: params.id },
      data: {
        name,
        description,
        url,
        logoPath,
      },
    })

    return NextResponse.json(charity)
  } catch (error) {
    console.error('Error updating charity:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const charity = await prisma.charity.findUnique({
      where: { id: params.id },
      include: {
        campaigns: {
          where: {
            status: {
              in: ['ACTIVE', 'UPCOMING'],
            },
          },
        },
      },
    })

    if (!charity) {
      return new NextResponse('Charity not found', { status: 404 })
    }

    // Check if charity is linked to any live campaigns
    if (charity.campaigns.length > 0) {
      return new NextResponse(
        'Cannot delete charity that is linked to live campaigns. Remove charity from campaigns first.',
        { status: 400 }
      )
    }

    // Delete logo file if it exists
    if (charity.logoPath) {
      const path = join(process.cwd(), 'public', charity.logoPath)
      try {
        await unlink(path)
      } catch (error) {
        console.error('Error deleting logo:', error)
      }
    }

    await prisma.charity.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting charity:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
