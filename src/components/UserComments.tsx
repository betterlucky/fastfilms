'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { MessageSquare, Edit, Trash2, X, Check, ArrowUpDown } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MAX_COMMENT_LENGTH = 500

interface UserComment {
  id: string
  content: string
  createdAt: Date
  campaign: {
    id: string
    title: string
    movieTitle: string
    screeningDate: Date
    venue: {
      name: string
    }
  }
}

interface Pagination {
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

type SortOrder = 'newest' | 'oldest'

export default function UserComments() {
  const [comments, setComments] = useState<UserComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const { toast } = useToast()

  const fetchComments = async (pageNum: number) => {
    try {
      const response = await fetch(`/api/user/comments?page=${pageNum}&sort=${sortOrder}`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(pageNum === 1 ? data.comments : [...comments, ...data.comments])
      setPagination(data.pagination)
    } catch (err) {
      setError('Failed to load comments')
      console.error('Error fetching comments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchComments(1)
  }, [sortOrder])

  useEffect(() => {
    fetchComments(page)
  }, [page])

  const handleEdit = (comment: UserComment) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
  }

  const handleSaveEdit = async () => {
    if (editContent.length > MAX_COMMENT_LENGTH) {
      toast({
        title: 'Comment too long',
        description: `Comments must be ${MAX_COMMENT_LENGTH} characters or less`,
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/user/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCommentId, content: editContent }),
      })

      if (!response.ok) throw new Error('Failed to update comment')

      const updatedComment = await response.json()
      setComments(comments.map(c => 
        c.id === editingCommentId ? updatedComment : c
      ))
      setEditingCommentId(null)
      setShowEditConfirm(false)
      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated successfully',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update comment',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch('/api/user/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId }),
      })

      if (!response.ok) throw new Error('Failed to delete comment')

      setComments(comments.filter(c => c.id !== commentId))
      toast({
        title: 'Comment deleted',
        description: 'Your comment has been deleted successfully',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      })
    }
  }

  if (isLoading && page === 1) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your comments on campaigns will appear here
            </p>
            <div className="mt-6">
              <Link href="/campaigns">
                <Button>View Campaigns</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
          value={sortOrder}
          onValueChange={(value: SortOrder) => setSortOrder(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={undefined} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    <div className="flex gap-2">
                      {editingCommentId === comment.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowEditConfirm(true)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingCommentId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(comment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(comment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[100px]"
                        maxLength={MAX_COMMENT_LENGTH}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>
                          {editContent.length}/{MAX_COMMENT_LENGTH} characters
                        </span>
                        {editContent.length > MAX_COMMENT_LENGTH && (
                          <span className="text-red-500">
                            Comment too long
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{comment.content}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <Link
                  href={`/campaigns/${comment.campaign.id}`}
                  className="group block"
                >
                  <h4 className="font-medium group-hover:text-primary">
                    {comment.campaign.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {comment.campaign.movieTitle} at {comment.campaign.venue.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.campaign.screeningDate).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={showEditConfirm} onOpenChange={setShowEditConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveEdit}>Update</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {pagination?.hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  )
} 