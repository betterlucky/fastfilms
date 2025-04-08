import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import BookingForm from './BookingForm'
import { BackButton } from './BackButton'
import { Suspense } from 'react'

export default async function BookPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      venue: true,
      screen: true,
      charity: true,
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
  })

  if (!campaign) {
    return <div>Campaign not found</div>
  }

  if (!session?.user) {
    redirect(`/login?callbackUrl=/campaigns/${params.id}/book`)
  }

  const formattedDate = new Date(campaign.screeningDate).toLocaleDateString(
    'en-GB',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  )

  // Transform menu items to match the expected format
  const formattedMenuItems = campaign.menuItems.map(({ menuItem }) => ({
    id: menuItem.id,
    name: menuItem.name,
    description: menuItem.description,
    price: Number(menuItem.price),
    category: menuItem.category,
    options: menuItem.options.map((option) => ({
      id: option.id,
      name: option.name,
      minChoices: option.minChoices,
      maxChoices: option.maxChoices,
      choices: option.choices.map((choice) => ({
        id: choice.id,
        name: choice.name,
        priceAdjustment: Number(choice.priceAdjustment),
      })),
    })),
  }))

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Book Tickets for {campaign.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="relative">
                    {campaign.isTest && (
                      <div className="absolute -right-[4.5rem] top-6 z-10 w-[200px] rotate-45 bg-red-500 py-2 text-center text-sm font-semibold text-white shadow-lg">
                        TEST CAMPAIGN
                      </div>
                    )}
                    <h2 className="text-lg font-semibold">Screening Details</h2>
                    <p>
                      {formattedDate} at {campaign.screeningTime}
                    </p>
                    <p className="text-gray-500">{campaign.venue.name}</p>
                    <p className="text-gray-500">
                      {campaign.venue.address}, {campaign.venue.city},{' '}
                      {campaign.venue.postcode}
                    </p>
                    {campaign.screen && (
                      <p className="text-gray-500">
                        Screen: {campaign.screen.name} (
                        {campaign.screen.capacity} seats)
                      </p>
                    )}
                  </div>

                  <BookingForm
                    campaignId={campaign.id}
                    maxTickets={Math.min(
                      10,
                      campaign.ticketCap - campaign.currentTickets
                    )}
                    charity={campaign.charity}
                    menuItems={formattedMenuItems}
                  />
                </div>

                <div>
                  {campaign.posterPath && (
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${campaign.posterPath}`}
                        alt={campaign.movieTitle}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mb-8 flex items-center justify-between">
        <BackButton campaignId={params.id} />
      </div>
    </div>
  )
}
