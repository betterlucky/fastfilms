import { Campaign } from '@prisma/client'

interface CampaignProgress {
  currentFunding: number
  fundingTarget: number
  progress: number
  isFullyFunded: boolean
  isSoldOut: boolean
  formattedCurrentFunding: string
  formattedFundingTarget: string
  formattedProgress: string
  timeLeft: { days: number }
  ticketsRemaining: number | null
  ticketsSold: number
  hasScreenAllocated: boolean
  status: 'not_funded' | 'funded' | 'sold_out'
}

/**
 * Formats a price in GBP
 */
export function formatCampaignPrice(amount: number | string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(Number(amount))
}

/**
 * Calculates days left until deadline
 */
export function calculateTimeLeft(deadlineDate: Date): { days: number } {
  const now = new Date()
  const difference = new Date(deadlineDate).getTime() - now.getTime()
  const days = Math.ceil(difference / (1000 * 60 * 60 * 24))
  return { days: Math.max(days, 0) }
}

/**
 * Calculates funding progress percentage
 */
export function calculateProgress(current: number | string, target: number | string): number {
  const currentNum = Number(current)
  const targetNum = Number(target)
  if (targetNum <= 0) return 0
  return Math.min((currentNum / targetNum) * 100, 100)
}

/**
 * Gets comprehensive campaign progress information
 */
export function getCampaignProgress(campaign: {
  currentFunding: number | string
  fundingTarget: number | string
  currentTickets: number
  ticketCap: number
  deadlineDate: Date
  screen?: { id: string } | null
}): CampaignProgress {
  const currentFunding = Number(campaign.currentFunding)
  const fundingTarget = Number(campaign.fundingTarget)
  const progress = calculateProgress(currentFunding, fundingTarget)
  const hasScreenAllocated = !!campaign.screen
  const isSoldOut = hasScreenAllocated && campaign.currentTickets >= campaign.ticketCap
  const isFullyFunded = currentFunding >= fundingTarget

  return {
    currentFunding,
    fundingTarget,
    progress,
    isFullyFunded,
    isSoldOut,
    formattedCurrentFunding: formatCampaignPrice(currentFunding),
    formattedFundingTarget: formatCampaignPrice(fundingTarget),
    formattedProgress: `${Math.round(progress)}%`,
    timeLeft: calculateTimeLeft(campaign.deadlineDate),
    ticketsRemaining: hasScreenAllocated ? campaign.ticketCap - campaign.currentTickets : null,
    ticketsSold: campaign.currentTickets,
    hasScreenAllocated,
    status: isSoldOut ? 'sold_out' : isFullyFunded ? 'funded' : 'not_funded'
  }
}

/**
 * Gets CSS classes for progress bar based on campaign status
 */
export function getProgressBarClasses(progress: CampaignProgress) {
  return {
    background: {
      'bg-green-100': progress.isFullyFunded && !progress.isSoldOut,
      'bg-red-100': progress.isSoldOut,
      'bg-gray-200': !progress.isFullyFunded
    },
    indicator: {
      'bg-green-500': progress.isFullyFunded && !progress.isSoldOut,
      'bg-red-500': progress.isSoldOut,
      'bg-primary': !progress.isFullyFunded
    }
  }
}

/**
 * Gets status message based on campaign progress
 */
export function getCampaignStatusMessage(progress: CampaignProgress): string {
  if (progress.isSoldOut) return 'SOLD OUT'
  if (progress.isFullyFunded) return 'Screening funded, tickets available'
  return `${progress.formattedProgress} funded`
} 