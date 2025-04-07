import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound } from "next/navigation"
import CampaignDetails from "./campaign-details"

export default async function CampaignPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === "ADMIN"

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      venue: true,
      screen: true,
      menuItems: {
        include: {
          menuItem: true
        }
      },
    },
  })

  if (!campaign) {
    notFound()
  }

  const [availableScreens, charities, venueMenuItems] = await Promise.all([
    prisma.screen.findMany({
      where: { venueId: campaign.venueId },
      select: { id: true, name: true, capacity: true },
    }),
    prisma.charity.findMany({
      select: { id: true, name: true },
    }),
    prisma.menuItem.findMany({
      where: { venueId: campaign.venueId },
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
      price: Number(menuItem.price)
    }))
  }

  // Convert venue menu item prices to numbers
  const venueMenuItemsWithNumberPrices = venueMenuItems.map(item => ({
    ...item,
    price: Number(item.price)
  }))

  return (
    <CampaignDetails
      campaign={campaignWithStringFunding}
      isAdmin={isAdmin}
      availableScreens={availableScreens}
      charities={charities}
      venueMenuItems={venueMenuItemsWithNumberPrices}
    />
  )
}