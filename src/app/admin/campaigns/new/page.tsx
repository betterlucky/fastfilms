import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { CampaignForm } from './campaign-form'
import { MenuItem, Screen, Venue } from '@prisma/client'

// Create a type for the serialized menu item where price is a number
type SerializedMenuItem = Omit<MenuItem, 'price'> & { price: number }
type SerializedVenue = Omit<Venue, 'menuItems'> & {
  screens: Screen[]
  menuItems: SerializedMenuItem[]
}

export default async function NewCampaignPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    redirect('/')
  }

  const venues = await prisma.venue.findMany({
    include: {
      screens: true,
      menuItems: {
        where: {
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  // Serialize Decimal objects to numbers for client components
  const serializedVenues: SerializedVenue[] = venues.map((venue) => ({
    ...venue,
    menuItems: venue.menuItems.map((item) => ({
      ...item,
      price: item.price.toNumber(), // Convert Decimal to number for client-side use
    })),
  }))

  const charities = await prisma.charity.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Create New Campaign</h1>
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignForm venues={serializedVenues} charities={charities} />
        </CardContent>
      </Card>
    </div>
  )
}
