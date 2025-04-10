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
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface ResetTicketDialogProps {
  ticket: {
    id: string
    status: string
  }
  purchaseId: string
  maxTickets: number
}

export function ResetTicketDialog({
  ticket,
  purchaseId,
  maxTickets,
}: ResetTicketDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleReset = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity,
          purchaseId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reset tickets')
      }

      toast({
        title: 'Success',
        description: `Reset ${quantity} ticket${quantity > 1 ? 's' : ''}`,
      })
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset tickets',
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
          Reset
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Tickets</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
            onClick={handleReset}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Tickets'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
