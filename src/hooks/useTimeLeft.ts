'use client'

import { useState, useEffect } from 'react'
import { calculateTimeLeft } from '@/lib/campaigns'

export function useTimeLeft(deadlineDate: Date) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(deadlineDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadlineDate))
    }, 1000 * 60) // Update every minute

    return () => clearInterval(interval)
  }, [deadlineDate])

  return timeLeft
}
