import { prisma } from './db'
import { formatPrice, formatDate, calculateProgress } from './utils'

export async function getFeaturedCampaign() {
  // First try to get the manually featured campaign that's still active and not past its deadline
  let campaign = await prisma.campaign.findFirst({
    where: {
      isFeatured: true,
      status: 'ACTIVE',
      deadlineDate: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      movieTitle: true,
      venueId: true,
      screeningDate: true,
      ticketCap: true,
      currentTickets: true,
      fundingTarget: true,
      currentFunding: true,
      deadlineDate: true,
      status: true,
      isFeatured: true,
      posterPath: true,
      isTest: true,
      venue: {
        select: {
          id: true,
          name: true,
        },
      },
      screen: {
        select: {
          id: true,
          name: true,
          capacity: true,
        },
      },
    },
  })

  // If no featured campaign is found or it's expired, get the next upcoming active campaign
  if (!campaign) {
    campaign = await prisma.campaign.findFirst({
      where: {
        status: 'ACTIVE',
        deadlineDate: {
          gt: new Date(),
        },
        screeningDate: {
          gt: new Date(),
        },
      },
      orderBy: {
        screeningDate: 'asc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        movieTitle: true,
        venueId: true,
        screeningDate: true,
        ticketCap: true,
        currentTickets: true,
        fundingTarget: true,
        currentFunding: true,
        deadlineDate: true,
        status: true,
        isFeatured: true,
        posterPath: true,
        isTest: true,
        venue: {
          select: {
            id: true,
            name: true,
          },
        },
        screen: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
      },
    })
  }

  if (!campaign) return null

  return {
    ...campaign,
    formattedTarget: formatPrice(campaign.fundingTarget),
    formattedCurrent: formatPrice(campaign.currentFunding),
    formattedDate: formatDate(campaign.screeningDate),
    progress: calculateProgress(
      campaign.currentFunding,
      campaign.fundingTarget
    ),
    timeLeft: calculateTimeLeft(campaign.deadlineDate),
    posterUrl: campaign.posterPath
      ? `https://image.tmdb.org/t/p/w500${campaign.posterPath}`
      : null,
    hasAssignedVenue: campaign.venueId !== null,
    hasScreenAllocated: campaign.screen !== null,
  }
}

// Function to toggle the featured status of a campaign
export async function toggleCampaignFeatured(campaignId: string) {
  // First, unfeature any currently featured campaigns
  await prisma.campaign.updateMany({
    where: {
      isFeatured: true,
    },
    data: {
      isFeatured: false,
    },
  })

  // Then feature the selected campaign
  const campaign = await prisma.campaign.update({
    where: {
      id: campaignId,
    },
    data: {
      isFeatured: true,
    },
  })

  return campaign
}

export function calculateTimeLeft(deadlineDate: Date): { days: number } {
  const now = new Date()
  const difference = deadlineDate.getTime() - now.getTime()
  const days = Math.ceil(difference / (1000 * 60 * 60 * 24))
  return { days: Math.max(days, 0) }
}

export async function getCampaigns(includeFeatured: boolean = false) {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: 'ACTIVE',
      deadlineDate: {
        gt: new Date(),
      }
    },
    orderBy: [
      {
        screeningDate: 'asc',
      }
    ],
    select: {
      id: true,
      title: true,
      description: true,
      movieTitle: true,
      venueId: true,
      screeningDate: true,
      deadlineDate: true,
      ticketCap: true,
      currentTickets: true,
      fundingTarget: true,
      currentFunding: true,
      status: true,
      isFeatured: true,
      posterPath: true,
      isTest: true,
      venue: {
        select: {
          id: true,
          name: true,
        },
      },
      screen: {
        select: {
          id: true,
          name: true,
          capacity: true,
        },
      },
    },
  })

  // Filter out duplicates by title and screeningDate
  const uniqueCampaigns = campaigns.reduce((acc, current) => {
    const key = `${current.title}-${current.screeningDate.toISOString()}`
    if (!acc.has(key)) {
      acc.set(key, current)
    }
    return acc
  }, new Map())

  return Array.from(uniqueCampaigns.values()).map((campaign) => ({
    ...campaign,
    fundingTarget: Number(campaign.fundingTarget),
    currentFunding: Number(campaign.currentFunding),
    formattedTarget: formatPrice(campaign.fundingTarget),
    formattedCurrent: formatPrice(campaign.currentFunding),
    formattedDate: formatDate(campaign.screeningDate),
    progress: calculateProgress(
      Number(campaign.currentFunding),
      Number(campaign.fundingTarget)
    ),
    timeLeft: calculateTimeLeft(campaign.deadlineDate),
    posterUrl: campaign.posterPath
      ? `https://image.tmdb.org/t/p/w500${campaign.posterPath}`
      : null,
    hasAssignedVenue: campaign.venueId !== null,
    hasScreenAllocated: campaign.screen !== null,
  }))
}
