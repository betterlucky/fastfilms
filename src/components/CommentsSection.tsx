'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AvatarWithFallback } from '@/components/ui/avatar-with-fallback'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { FaThumbsUp, FaThumbsDown, FaEdit, FaTrash, FaReply, FaTimes } from 'react-icons/fa'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    avatarColor?: string | null
  }
  replies: Comment[]
  likes: number
  dislikes: number
  userReaction?: 'like' | 'dislike'
}

interface CommentsSectionProps {
  campaignId: string
  initialComments: Comment[]
}

interface CommentItemProps {
  comment: Comment
  onReply: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onReact: (id: string, reaction: 'like' | 'dislike') => void
}

export default function CommentsSection({ campaignId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  // Handle mentions in content
  const processMentions = (content: string) => {
    return content.split(/(@\w+)/g).map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-blue-500 font-medium">{part}</span>
      }
      return part
    })
  }

  // Handle comment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })

      if (!response.ok) throw new Error('Failed to post comment')

      const newCommentData = await response.json()
      setComments([newCommentData, ...comments])
      setNewComment('')
      toast.success('Comment posted successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle reply submission
  const handleReply = async (parentId: string) => {
    if (!session?.user || !replyContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: replyContent,
          parentId 
        }),
      })

      if (!response.ok) throw new Error('Failed to post reply')

      const newReply = await response.json()
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, newReply]
          }
        }
        return comment
      }))
      setReplyContent('')
      setReplyingTo(null)
      toast.success('Reply posted successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error('Failed to post reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle comment editing
  const handleEdit = async (commentId: string) => {
    if (!session?.user || !editContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })

      if (!response.ok) throw new Error('Failed to edit comment')

      const updatedComment = await response.json()
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return updatedComment
        }
        if (comment.replies.some(reply => reply.id === commentId)) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id === commentId ? updatedComment : reply
            )
          }
        }
        return comment
      }))
      setEditingComment(null)
      setEditContent('')
      toast.success('Comment updated successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error editing comment:', error)
      toast.error('Failed to edit comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle comment deletion
  const handleDelete = async (commentId: string) => {
    if (!session?.user) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete comment')

      setComments(comments.filter(comment => {
        if (comment.id === commentId) return false
        if (comment.replies.some(reply => reply.id === commentId)) {
          comment.replies = comment.replies.filter(reply => reply.id !== commentId)
        }
        return true
      }))
      setDeleteDialogOpen(false)
      setCommentToDelete(null)
      toast.success('Comment deleted successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle reactions
  const handleReaction = async (commentId: string, reaction: 'like' | 'dislike') => {
    if (!session?.user) return

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/comments/${commentId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      })

      if (!response.ok) throw new Error('Failed to update reaction')

      const updatedComment = await response.json()
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return updatedComment
        }
        if (comment.replies.some(reply => reply.id === commentId)) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id === commentId ? updatedComment : reply
            )
          }
        }
        return comment
      }))
    } catch (error) {
      console.error('Error updating reaction:', error)
      toast.error('Failed to update reaction')
    }
  }

  const CommentItem = ({ comment, onReply, onEdit, onDelete, onReact }: CommentItemProps) => {
    return (
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <AvatarWithFallback
            src={comment.user.image}
            name={comment.user.name}
            email={comment.user.email}
            avatarColor={comment.user.avatarColor}
            className="h-12 w-12"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">{comment.user.name || 'Anonymous'}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              {session?.user?.id === comment.user.id && (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(comment.id)}
                    className="text-gray-500 hover:text-gray-900"
                  >
                    <FaEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(comment.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <FaTrash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="mt-1 text-gray-700">{processMentions(comment.content)}</p>
            <div className="mt-2 flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReact(comment.id, 'like')}
                className={cn(
                  'text-gray-500 hover:text-blue-500',
                  comment.userReaction === 'like' && 'text-blue-500'
                )}
              >
                <FaThumbsUp className="h-4 w-4 mr-1" />
                {comment.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReact(comment.id, 'dislike')}
                className={cn(
                  'text-gray-500 hover:text-red-500',
                  comment.userReaction === 'dislike' && 'text-red-500'
                )}
              >
                <FaThumbsDown className="h-4 w-4 mr-1" />
                {comment.dislikes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment.id)}
                className="text-gray-500 hover:text-gray-900"
              >
                <FaReply className="h-4 w-4 mr-1" />
                Reply
              </Button>
            </div>
          </div>
        </div>
        {comment.replies.length > 0 && (
          <div className="ml-12 pl-4 border-l-2 border-gray-200">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReact={onReact}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Comments</h2>
      
      {session?.user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          Please <a href="/login" className="text-blue-500 hover:underline">sign in</a> to leave a comment
        </p>
      )}

      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(id) => {
                setReplyingTo(id)
                setReplyContent('')
              }}
              onEdit={(id) => {
                setEditingComment(id)
                setEditContent(comment.content)
              }}
              onDelete={(id) => {
                setCommentToDelete(id)
                setDeleteDialogOpen(true)
              }}
              onReact={(id, reaction) => handleReaction(id, reaction)}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => commentToDelete && handleDelete(commentToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 