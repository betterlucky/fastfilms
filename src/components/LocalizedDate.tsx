'use client'

import { useState, useEffect } from 'react'

export function LocalizedDate({ date }: { date: string }) {
  const [formattedDate, setFormattedDate] = useState('')

  useEffect(() => {
    setFormattedDate(
      new Date(date).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    )
  }, [date])

  return <>{formattedDate}</>
}
