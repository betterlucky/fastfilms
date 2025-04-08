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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface AllocateTicketDialogProps {
  ticket: {
    id: string
    campaign: {
      title: string
      movieTitle: string
      screeningDate: string
    }
  }
}

export function AllocateTicketDialog({ ticket }: AllocateTicketDialogProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First find the user by email
      const userResponse = await fetch(
        `/api/users/by-email?email=${encodeURIComponent(email)}`
      )
      if (!userResponse.ok) {
        throw new Error('User not found')
      }
      const user = await userResponse.json()

      // Then allocate the ticket
      const response = await fetch('/api/admin/tickets/allocate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to allocate ticket')
      }

      toast({
        title: 'Success',
        description: 'Ticket has been allocated successfully',
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to allocate ticket',
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
          Allocate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Allocate Pay It Forward Ticket</DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter the email address of the user you want to allocate this ticket
            to. The ticket is for {ticket.campaign.movieTitle} on{' '}
            {new Date(ticket.campaign.screeningDate).toLocaleDateString()}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3 bg-white text-gray-900"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="bg-primary text-white hover:bg-primary/90">
              {isLoading ? 'Allocating...' : 'Allocate Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
