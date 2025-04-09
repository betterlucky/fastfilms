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

interface ResetTicketDialogProps {
  ticket: {
    id: string
    status: string
  }
  purchaseId: string
}

export function ResetTicketDialog({ ticket, purchaseId }: ResetTicketDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleReset = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purchaseId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reset ticket')
      }

      toast({
        title: 'Success',
        description: 'Ticket reset successfully',
      })
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset ticket',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Reset Ticket</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Are you sure you want to reset this ticket? This will make it available for reallocation.</p>
          <Button onClick={handleReset} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Ticket'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
