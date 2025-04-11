import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { content } = await request.json()
    if (!content?.trim()) {
      return new NextResponse('Content is required', { status: 400 })
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.commentId },
      select: { userId: true }
    })

    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 })
    }

    if (comment.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const updatedComment = await prisma.comment.update({
      where: { id: params.commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('Error updating comment:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.commentId },
      select: { userId: true }
    })

    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 })
    }

    if (comment.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await prisma.comment.delete({
      where: { id: params.commentId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 