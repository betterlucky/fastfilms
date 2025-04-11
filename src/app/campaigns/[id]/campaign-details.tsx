'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { CalendarIcon, Clock, Users, Ticket } from 'lucide-react'
import { getCampaignProgress, getProgressBarClasses } from '@/lib/campaign-utils'
import CommentsSection from '@/components/CommentsSection'

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
  replies: (Comment & {
    user: {
      id: string
      name: string | null
      image: string | null
    }
  })[]
  likes: number
  dislikes: number
  userReaction?: 'like' | 'dislike'
}

interface CampaignDetailsProps {
  campaign: {
    id: string
    title: string
    description: string
    movieTitle: string
    screeningDate: Date
    ticketCap: number
    currentTickets: number
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
    isTest: boolean
    currentFunding: string
    fundingTarget: string
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
  initialComments: Comment[]
}

export default function CampaignDetails({
  campaign,
  isAdmin,
  availableScreens,
  charities,
  venueMenuItems,
  initialComments,
}: CampaignDetailsProps) {
  const screeningDate = new Date(campaign.screeningDate)
  // Adjust for UK timezone (add one hour to match campaign listing)
  screeningDate.setHours(screeningDate.getHours() + 1)
  const formattedDate = screeningDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const formattedTime = screeningDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const formattedDeadlineDate = new Date(
    campaign.deadlineDate
  ).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const progress = getCampaignProgress({
    ...campaign,
    currentFunding: Number(campaign.currentFunding),
    fundingTarget: Number(campaign.fundingTarget)
  })
  const progressClasses = getProgressBarClasses(progress)

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <div className="relative">
                      {campaign.isTest && (
                        <div className="absolute -right-12 top-6 z-10 w-[200px] rotate-45 bg-red-500 py-2 text-center text-sm font-semibold text-white shadow-lg">
                          TEST CAMPAIGN
                        </div>
                      )}
                      <h1 className="text-2xl font-bold">{campaign.title}</h1>
                      <p className="text-gray-500">{campaign.description}</p>
                    </div>
                    <div className="mt-4">
                      <div className="flex flex-col gap-4 md:flex-row">
                        <Button
                          size="lg"
                          className="w-full md:w-auto"
                          onClick={() =>
                            (window.location.href = `/campaigns/${campaign.id}/book`)
                          }
                        >
                          Book Tickets
                        </Button>
                      </div>
                      {campaign.charityId && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-4">
                          <p className="text-sm text-green-700">
                            Proudly supporting{' '}
                            {
                              charities.find((c) => c.id === campaign.charityId)
                                ?.name
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Progress Indicators */}
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Funding Progress</span>
                          <span>
                            {progress.formattedCurrentFunding} of{' '}
                            {progress.formattedFundingTarget}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <Progress
                            value={progress.progress}
                            className={cn('h-2', progressClasses.background)}
                            indicatorClassName={cn(progressClasses.indicator)}
                          />
                          {progress.isFullyFunded && (
                            <p
                              className={cn('text-sm font-medium', {
                                'text-green-600': !progress.isSoldOut,
                                'text-red-600': progress.isSoldOut,
                              })}
                            >
                              {progress.isSoldOut
                                ? 'Screening SOLD OUT!'
                                : 'Screening funded! Tickets still available'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          <CalendarIcon className="mr-2 size-4" />
                          <span>
                            Screening:{' '}
                            {formattedDate} at {formattedTime}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Clock className="mr-2 size-4" />
                          <span>
                            Deadline:{' '}
                            {new Date(campaign.deadlineDate).toLocaleDateString(
                              'en-GB',
                              {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Users className="mr-2 size-4" />
                          {progress.ticketsRemaining !== null ? (
                            <span>
                              {progress.ticketsRemaining} tickets remaining
                            </span>
                          ) : (
                            <span>{progress.ticketsSold} tickets sold</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {campaign.posterPath && (
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                      <Image
                        src={
                          campaign.posterPath.startsWith('http')
                            ? campaign.posterPath
                            : `https://image.tmdb.org/t/p/w500${campaign.posterPath}`
                        }
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
                    <h2 className="text-lg font-semibold">
                      Additional Information
                    </h2>
                    <p>{campaign.customBlurb}</p>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-semibold">Campaign Details</h2>
                  <dl className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-gray-500">Tickets Sold</dt>
                      <dd>{campaign.currentTickets}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Screening Date</dt>
                      <dd>
                        {formattedDate} at {formattedTime}
                      </dd>
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
                        <dd>
                          {campaign.screen.name} ({campaign.screen.capacity}{' '}
                          seats)
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardContent className="p-6">
              <CommentsSection
                campaignId={campaign.id}
                initialComments={initialComments}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
