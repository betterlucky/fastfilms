'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

interface AllocateTicketDialogProps {
  ticket: {
    id: string
    status: string
  }
  purchaseId: string
  maxTickets: number
}

export function AllocateTicketDialog({
  ticket,
  purchaseId,
  maxTickets,
}: AllocateTicketDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAllocate = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          quantity,
          purchaseId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to allocate tickets')
      }

      toast({
        title: 'Success',
        description: `Allocated ${quantity} ticket${quantity > 1 ? 's' : ''} to ${email}`,
      })
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to allocate tickets',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Allocate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Allocate Tickets</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter recipient's email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Number of Tickets</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxTickets}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(Number(e.target.value), maxTickets))}
            />
            <p className="text-sm text-gray-500">
              Maximum {maxTickets} ticket{maxTickets > 1 ? 's' : ''} available
            </p>
          </div>
          <Button
            onClick={handleAllocate}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Allocating...' : 'Allocate Tickets'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
