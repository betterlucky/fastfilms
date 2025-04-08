'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  campaignId: string
}

export function BackButton({ campaignId }: BackButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      onClick={() => router.push(`/campaigns/${campaignId}`)}
    >
      Back to Campaign
    </Button>
  )
}
