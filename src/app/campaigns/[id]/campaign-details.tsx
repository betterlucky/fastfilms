'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

interface CampaignDetailsProps {
  campaign: {
    id: string
    title: string
    description: string
    movieTitle: string
    screeningDate: Date
    screeningTime: string
    ticketCap: number
    currentTickets: number
    fundingTarget: string
    currentFunding: string
    customBlurb: string | null
    posterPath: string | null
    deadlineDate: Date
    screenId: string | null
    screen: {
      id: string
      name: string
      capacity: number
    } | null
    venue: {
      id: string
      name: string
    }
    charityId: string | null
    menuItems: {
      id: string
      name: string
      description: string
      price: number
      category: string
    }[]
  }
  isAdmin: boolean
  availableScreens: {
    id: string
    name: string
    capacity: number
  }[]
  charities: {
    id: string
    name: string
  }[]
  venueMenuItems: {
    id: string
    name: string
    description: string
    price: number
    category: string
  }[]
}

export default function CampaignDetails({
  campaign,
  isAdmin,
  availableScreens,
  charities,
  venueMenuItems,
}: CampaignDetailsProps) {
  const formattedDate = new Date(campaign.screeningDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const formattedDeadlineDate = new Date(campaign.deadlineDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h1 className="text-2xl font-bold">{campaign.title}</h1>
                    <p className="text-gray-500">{campaign.description}</p>
                    <div className="mt-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <Button 
                          size="lg" 
                          className="w-full md:w-auto"
                          onClick={() => window.location.href = `/campaigns/${campaign.id}/book`}
                        >
                          Book Tickets
                        </Button>
                      </div>
                      {campaign.charityId && (
                        <div className="mt-4 flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">
                            Proudly supporting {charities.find(c => c.id === campaign.charityId)?.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {campaign.posterPath && (
                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
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

                {campaign.customBlurb && (
                  <div>
                    <h2 className="text-lg font-semibold">Additional Information</h2>
                    <p>{campaign.customBlurb}</p>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-semibold">Campaign Details</h2>
                  <dl className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <dt className="text-gray-500">Target Funding</dt>
                      <dd>£{campaign.fundingTarget}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Current Funding</dt>
                      <dd>£{campaign.currentFunding}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Tickets Sold</dt>
                      <dd>{campaign.currentTickets}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Screening Date</dt>
                      <dd>{formattedDate} at {campaign.screeningTime}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Campaign Deadline</dt>
                      <dd>{formattedDeadlineDate}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Venue</dt>
                      <dd>{campaign.venue.name}</dd>
                    </div>
                    {campaign.screen && (
                      <div>
                        <dt className="text-gray-500">Screen</dt>
                        <dd>{campaign.screen.name} ({campaign.screen.capacity} seats)</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 