import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

const COMMENTS_PER_PAGE = 10

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const sort = searchParams.get('sort') || 'newest'
    const skip = (page - 1) * COMMENTS_PER_PAGE

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          userId: session.user.id,
          parentId: null, // Only get top-level comments
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          campaign: {
            select: {
              id: true,
              title: true,
              movieTitle: true,
              screeningDate: true,
              venue: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: sort === 'newest' ? 'desc' : 'asc',
        },
        skip,
        take: COMMENTS_PER_PAGE,
      }),
      prisma.comment.count({
        where: {
          userId: session.user.id,
          parentId: null,
        },
      }),
    ])

    return NextResponse.json({
      comments,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / COMMENTS_PER_PAGE),
        hasMore: page * COMMENTS_PER_PAGE < total,
      },
    })
  } catch (error) {
    console.error('Error fetching user comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await request.json()

    // Verify the comment belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete the comment and its replies
    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Verify the comment belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
      select: {
        id: true,
        content: true,
        createdAt: true,
        campaign: {
          select: {
            id: true,
            title: true,
            movieTitle: true,
            screeningDate: true,
            venue: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
} 