import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { reaction } = await request.json()
    if (!['like', 'dislike'].includes(reaction)) {
      return new NextResponse('Invalid reaction', { status: 400 })
    }

    // Get the current reaction if it exists
    const existingReaction = await prisma.commentReaction.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: params.commentId
        }
      }
    })

    // If the user is trying to remove their reaction
    if (existingReaction?.reaction === reaction) {
      await prisma.commentReaction.delete({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId: params.commentId
          }
        }
      })
    } else {
      // Update or create the reaction
      await prisma.commentReaction.upsert({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId: params.commentId
          }
        },
        update: {
          reaction
        },
        create: {
          userId: session.user.id,
          commentId: params.commentId,
          reaction
        }
      })
    }

    // Get the updated comment with reaction counts
    const updatedComment = await prisma.comment.findUnique({
      where: { id: params.commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            avatarColor: true,
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                avatarColor: true,
              }
            }
          }
        },
        reactions: {
          where: {
            userId: session.user.id
          },
          select: {
            reaction: true
          }
        }
      }
    })

    if (!updatedComment) {
      return new NextResponse('Comment not found', { status: 404 })
    }

    // Calculate likes and dislikes
    const likes = await prisma.commentReaction.count({
      where: {
        commentId: params.commentId,
        reaction: 'like'
      }
    })

    const dislikes = await prisma.commentReaction.count({
      where: {
        commentId: params.commentId,
        reaction: 'dislike'
      }
    })

    // Get the user's reaction
    const userReaction = updatedComment.reactions[0]?.reaction

    return NextResponse.json({
      ...updatedComment,
      likes,
      dislikes,
      userReaction,
      reactions: undefined // Remove the reactions array from the response
    })
  } catch (error) {
    console.error('Error updating reaction:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 