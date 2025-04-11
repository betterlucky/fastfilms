'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { FaEnvelope } from 'react-icons/fa'

interface ResendConfirmationButtonProps {
  ticketIds: string[]
  className?: string
}

export function ResendConfirmationButton({
  ticketIds,
  className,
}: ResendConfirmationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleResend = async () => {
    setIsLoading(true)
    try {
      // Send only one request with all ticket IDs
      const response = await fetch(`/api/tickets/resend-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketIds }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to resend confirmation')
      }

      toast({
        title: 'Success',
        description: 'Confirmation email has been resent.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to resend confirmation',
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
      <FaEnvelope className="mr-2 size-4" />
      {isLoading ? 'Sending...' : 'Resend Confirmation'}
    </Button>
  )
}
