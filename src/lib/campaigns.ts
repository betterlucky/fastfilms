import { prisma } from "./db";
import { formatPrice, formatDate, calculateProgress, calculateTimeLeft } from "./utils";

export async function getFeaturedCampaign() {
  // First try to get the manually featured campaign that's still active and not past its deadline
  let campaign = await prisma.campaign.findFirst({
    where: {
      isFeatured: true,
      status: "ACTIVE",
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
      venue: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // If no featured campaign is found or it's expired, get the next upcoming active campaign
  if (!campaign) {
    campaign = await prisma.campaign.findFirst({
      where: {
        status: "ACTIVE",
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
        venue: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  if (!campaign) return null;

  return {
    ...campaign,
    fundingTarget: campaign.fundingTarget.toString(),
    currentFunding: campaign.currentFunding.toString(),
    formattedTarget: formatPrice(Number(campaign.fundingTarget)),
    formattedCurrent: formatPrice(Number(campaign.currentFunding)),
    formattedDate: formatDate(campaign.screeningDate),
    progress: calculateProgress(Number(campaign.currentFunding), Number(campaign.fundingTarget)),
    timeLeft: calculateTimeLeft(campaign.deadlineDate),
    posterUrl: campaign.posterPath 
      ? `https://image.tmdb.org/t/p/w500${campaign.posterPath}`
      : null,
    hasAssignedVenue: campaign.venueId !== null,
  };
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
  });

  // Then feature the selected campaign
  const campaign = await prisma.campaign.update({
    where: {
      id: campaignId,
    },
    data: {
      isFeatured: true,
    },
  });

  return campaign;
} 