'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { MailIcon } from 'lucide-react'

interface ResendConfirmationButtonProps {
  ticketIds: string[]
  className?: string
}

export function ResendConfirmationButton({ ticketIds, className }: ResendConfirmationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleResend = async () => {
    setIsLoading(true)
    try {
      const responses = await Promise.all(
        ticketIds.map(ticketId =>
          fetch(`/api/tickets/${ticketId}/resend-confirmation`, {
            method: 'POST',
          })
        )
      )

      const errors = await Promise.all(
        responses.map(async (response, index) => {
          if (!response.ok) {
            const data = await response.json()
            return { ticketId: ticketIds[index], error: data.error || 'Failed to resend confirmation' }
          }
          return null
        })
      )

      const failedTickets = errors.filter(Boolean)
      if (failedTickets.length > 0) {
        throw new Error(
          `Failed to resend confirmation for tickets: ${failedTickets
            .map(t => t?.ticketId)
            .join(', ')}`
        )
      }

      toast({
        title: 'Success',
        description: 'Confirmation emails have been resent.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to resend confirmation',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResend}
      disabled={isLoading}
      className={className}
    >
      <MailIcon className="mr-2 size-4" />
      {isLoading ? 'Sending...' : 'Resend Confirmation'}
    </Button>
  )
} 