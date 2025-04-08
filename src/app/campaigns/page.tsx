import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CalendarIcon, Clock, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getCampaigns } from '@/lib/campaigns'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface Campaign {
  id: string
  title: string
  movieTitle: string
  description: string
  posterUrl: string | null
  venue: {
    name: string
  }
  currentTickets: number
  ticketCap: number
  formattedDate: string
  timeLeft: {
    days: number
  }
  formattedTarget: string
  formattedCurrent: string
  progress: number
  screeningDate: Date
  deadlineDate: Date
  isTest: boolean
  screen: {
    id: string
    name: string
    capacity: number
  } | null
}

export default async function CampaignsPage() {
  // Get all active campaigns in date order
  const campaigns = await getCampaigns()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaigns</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
            <Card className="h-full transition-transform hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <CardTitle>{campaign.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-4">
                  <div className="relative">
                    {campaign.isTest && (
                      <div className="absolute right-[calc(100%-4.5rem)] top-6 z-10 w-[200px] rotate-45 bg-red-500 py-2 text-center text-sm font-semibold text-white shadow-lg">
                        TEST CAMPAIGN
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">{campaign.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="mr-2 size-4" />
                      <span>
                        Screening:{' '}
                        {new Date(campaign.screeningDate).toLocaleDateString(
                          'en-GB',
                          {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
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
                        )}{' '}
                        ({campaign.timeLeft.days} days left)
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="mr-2 size-4" />
                      {campaign.screen ? (
                        <span>
                          {campaign.ticketCap - campaign.currentTickets} tickets
                          remaining
                        </span>
                      ) : (
                        <span>{campaign.currentTickets} tickets sold</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Funding Progress</span>
                      <span>
                        {campaign.formattedCurrent} of{' '}
                        {campaign.formattedTarget}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress
                        value={campaign.progress}
                        className={cn('h-2', {
                          'bg-green-100':
                            campaign.progress >= 100 &&
                            campaign.currentTickets < campaign.ticketCap,
                          'bg-red-100':
                            campaign.currentTickets >= campaign.ticketCap,
                        })}
                        indicatorClassName={cn({
                          'bg-green-500':
                            campaign.progress >= 100 &&
                            campaign.currentTickets < campaign.ticketCap,
                          'bg-red-500':
                            campaign.currentTickets >= campaign.ticketCap,
                          'bg-primary': campaign.progress < 100,
                        })}
                      />
                      {campaign.progress >= 100 && (
                        <p
                          className={cn('text-sm font-medium', {
                            'text-green-600':
                              campaign.currentTickets < campaign.ticketCap,
                            'text-red-600':
                              campaign.currentTickets >= campaign.ticketCap,
                          })}
                        >
                          {campaign.currentTickets >= campaign.ticketCap
                            ? 'Screening SOLD OUT!'
                            : 'Screening funded! Tickets still available'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
