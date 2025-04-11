import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(date: Date): string {
  return date.toISOString()
}

export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return (current / target) * 100
}

export function calculateTimeLeft(deadlineDate: Date): { days: number } {
  const now = new Date()
  const difference = deadlineDate.getTime() - now.getTime()
  const days = Math.ceil(difference / (1000 * 60 * 60 * 24))
  return { days: Math.max(days, 0) }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount)
}
