'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

interface ResetTicketDialogProps {
  ticket: {
    id: string
    user: {
      name: string
      email: string
    }
    campaign: {
      title: string
      movieTitle: string
      screeningDate: string
    }
  }
}

export function ResetTicketDialog({ ticket }: ResetTicketDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/tickets/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: ticket.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reset ticket')
      }

      toast({
        title: 'Success',
        description: 'Ticket has been reset to Pay It Forward status',
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to reset ticket',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Reset to PIF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Ticket to Pay It Forward</DialogTitle>
          <DialogDescription>
            Are you sure you want to reset this ticket back to Pay It Forward
            status? This will remove it from {ticket.user.name}&apos;s (
            {ticket.user.email}) tickets. The ticket is for{' '}
            {ticket.campaign.movieTitle} on{' '}
            {new Date(ticket.campaign.screeningDate).toLocaleDateString()}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
