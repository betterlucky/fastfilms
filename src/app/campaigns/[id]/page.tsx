import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import CampaignDetails from './campaign-details'

export default async function CampaignPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'ADMIN'

  const transformComment = (comment: any) => ({
    ...comment,
    likes: comment.reactions.filter(r => r.reaction === 'like').length,
    dislikes: comment.reactions.filter(r => r.reaction === 'dislike').length,
    replies: comment.replies.map(transformComment),
  })

  const [campaign, rawComments] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id },
      include: {
        venue: true,
        charity: true,
        screen: true,
        menuItems: {
          include: {
            menuItem: {
              include: {
                options: {
                  include: {
                    choices: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.comment.findMany({
      where: { campaignId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        reactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ])

  const comments = rawComments.map(transformComment)

  if (!campaign) {
    notFound()
  }

  const [availableScreens, charities, venueMenuItems] = await Promise.all([
    prisma.screen.findMany({
      where: { venueId: campaign.venue.id },
      select: { id: true, name: true, capacity: true },
    }),
    prisma.charity.findMany({
      select: { id: true, name: true },
    }),
    prisma.menuItem.findMany({
      where: { venueId: campaign.venue.id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
      },
    }),
  ])

  // Convert funding values to strings and format menu items
  const campaignWithStringFunding = {
    ...campaign,
    fundingTarget: campaign.fundingTarget.toString(),
    currentFunding: campaign.currentFunding.toString(),
    menuItems: campaign.menuItems.map(({ menuItem }) => ({
      ...menuItem,
      price: Number(menuItem.price),
    })),
  }

  // Convert venue menu item prices to numbers
  const venueMenuItemsWithNumberPrices = venueMenuItems.map((item) => ({
    ...item,
    price: Number(item.price),
  }))

  return (
    <CampaignDetails
      campaign={campaignWithStringFunding}
      isAdmin={isAdmin}
      availableScreens={availableScreens}
      charities={charities}
      venueMenuItems={venueMenuItemsWithNumberPrices}
      initialComments={comments}
    />
  )
}
