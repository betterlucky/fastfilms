import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CampaignEditForm } from './campaign-edit-form'
import { Campaign, Venue, Charity, MenuItem, Screen } from '@prisma/client'

// Create types for serialized data where Decimal is converted to number
type SerializedMenuItem = Omit<MenuItem, 'price'> & { price: number }
type SerializedVenue = Omit<Venue, 'menuItems'> & {
  screens: Screen[]
  menuItems: SerializedMenuItem[]
}
type SerializedCampaign = Omit<Campaign, 'fundingTarget' | 'currentFunding'> & {
  fundingTarget: number
  currentFunding: number
  venue: SerializedVenue
  menuItems: {
    menuItem: SerializedMenuItem
  }[]
  charity: Charity | null
}

export default async function CampaignEditPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const [campaign, venues, charities] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id },
      include: {
        venue: {
          include: {
            screens: true,
            menuItems: {
              where: { isActive: true },
              orderBy: { category: 'asc' },
            },
          },
        },
        menuItems: {
          include: {
            menuItem: true,
          },
        },
        charity: true,
      },
    }),
    prisma.venue.findMany({
      include: {
        screens: true,
        menuItems: {
          where: { isActive: true },
          orderBy: { category: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.charity.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  if (!campaign) {
    redirect('/admin/campaigns')
  }

  // Serialize Decimal values to numbers
  const serializedCampaign: SerializedCampaign = {
    ...campaign,
    fundingTarget: Number(campaign.fundingTarget),
    currentFunding: Number(campaign.currentFunding),
    venue: {
      ...campaign.venue,
      menuItems: campaign.venue.menuItems.map(item => ({
        ...item,
        price: Number(item.price)
      }))
    },
    menuItems: campaign.menuItems.map(({ menuItem }) => ({
      menuItem: {
        ...menuItem,
        price: Number(menuItem.price)
      }
    }))
  }

  // Serialize venue menu item prices
  const serializedVenues: SerializedVenue[] = venues.map(venue => ({
    ...venue,
    menuItems: venue.menuItems.map(item => ({
      ...item,
      price: Number(item.price)
    }))
  }))

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Campaign</h1>
          <Button variant="outline" asChild>
            <Link href="/admin/campaigns">Back to Campaigns</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{campaign.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CampaignEditForm
              campaign={serializedCampaign}
              venues={serializedVenues}
              charities={charities}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
