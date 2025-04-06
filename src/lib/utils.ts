import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 0
  const progress = (current / target) * 100
  return Math.min(Math.max(progress, 0), 100)
}

export function calculateTimeLeft(deadlineDate: Date): { days: number } {
  const now = new Date()
  const difference = deadlineDate.getTime() - now.getTime()
  const days = Math.ceil(difference / (1000 * 60 * 60 * 24))
  return { days: Math.max(days, 0) }
} 