'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Campaign {
  id: string
  title: string
  movieTitle: string
  description: string
  posterPath: string | null
  posterUrl: string | null
  fundingTarget: number
  currentFunding: number
  currentTickets: number
  ticketCap: number
  screeningDate: Date
  deadlineDate: Date
  formattedDate: string
  timeLeft: { days: number }
  venue: {
    name: string
    id: string
  }
  screen: {
    name: string
    id: string
    capacity: number
  } | null
  hasScreenAllocated: boolean
  isTest: boolean
}

interface CampaignHeroProps {
  campaign: Campaign
}

export function CampaignHero({ campaign }: CampaignHeroProps) {
  const router = useRouter()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Bring Cinema to Your Community
        </h1>
        <p className="mx-auto max-w-3xl text-xl text-gray-600">
          Support and attend community film screenings across Cornwall. Book
          tickets, pre-order food and drinks, and help bring cinema to your
          local area.
        </p>
      </section>

      {/* Featured Campaign Section */}
      <section className="mx-auto max-w-4xl">
        <div
          className="group block cursor-pointer"
          onClick={() => router.push(`/campaigns/${campaign.id}`)}
        >
          <Card className="border-primary border-2 transition-transform hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl group-hover:text-gray-600">
                {campaign.movieTitle}
              </CardTitle>
              <CardDescription>{campaign.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                {campaign.isTest && (
                  <div className="absolute -right-[4.5rem] top-6 z-10 w-[200px] rotate-45 bg-red-500 py-2 text-center text-sm font-semibold text-white shadow-lg">
                    TEST CAMPAIGN
                  </div>
                )}
                {(campaign.posterUrl || campaign.posterPath) ? (
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                    <Image
                      src={campaign.posterUrl || `https://image.tmdb.org/t/p/w500${campaign.posterPath}`}
                      alt={campaign.movieTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center rounded-lg bg-gray-200">
                    <span className="text-gray-500">No poster available</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">{campaign.description}</p>
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Cinema: {campaign.venue.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      £{campaign.currentFunding.toFixed(2)} raised
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Date: {campaign.formattedDate}
                    </p>
                    <p className="text-sm text-gray-500">
                      {campaign.timeLeft.days} days left
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Target: £{campaign.fundingTarget.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.round((campaign.currentFunding / campaign.fundingTarget) * 100)}% funded
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2.5 rounded-full ${
                          campaign.currentFunding >= campaign.fundingTarget
                            ? campaign.hasScreenAllocated && campaign.currentTickets >= campaign.ticketCap
                              ? 'bg-red-500'
                              : 'bg-green-500'
                            : 'bg-primary'
                        }`}
                        style={{
                          width: `${Math.min((campaign.currentFunding / campaign.fundingTarget) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    {campaign.currentFunding >= campaign.fundingTarget && (
                      <p
                        className={`text-sm font-medium ${
                          campaign.hasScreenAllocated && campaign.currentTickets >= campaign.ticketCap
                            ? 'text-red-500'
                            : 'text-green-500'
                        }`}
                      >
                        {campaign.hasScreenAllocated && campaign.currentTickets >= campaign.ticketCap
                          ? 'SOLD OUT'
                          : 'Screening funded, tickets available'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Tickets from £5 + £0.50 fee
              </div>
              <div className="text-primary font-semibold group-hover:text-gray-600">
                Support This Campaign →
              </div>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Community Powered</CardTitle>
            <CardDescription>Support local cinema initiatives</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Help bring cinema to your area by supporting crowdfunding
              campaigns. Every ticket counts!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Food & Drink</CardTitle>
            <CardDescription>Pre-order from local venues</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Enjoy delicious food and drinks from our partner venues. Pre-order
              with your tickets for a seamless experience.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flexible Pricing</CardTitle>
            <CardDescription>From £5 per ticket</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Affordable ticket pricing with a minimum of £5 plus a small
              transaction fee. Help make cinema accessible to all.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Secondary CTA */}
      <section className="space-y-4 text-center">
        <h2 className="text-3xl font-bold">Want to See More?</h2>
        <p className="mx-auto max-w-2xl text-xl text-gray-600">
          Browse our upcoming campaigns and help bring cinema to your community.
        </p>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push('/campaigns')}
        >
          View All Campaigns
        </Button>
      </section>
    </div>
  )
}
