import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CalendarIcon, Clock, Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getCampaigns } from '@/lib/campaigns'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { getCampaignProgress, getProgressBarClasses } from '@/lib/campaign-utils'

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
  screeningDate: Date
  deadlineDate: Date
  currentFunding: number
  fundingTarget: number
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
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Upcoming Screenings</h1>
          <p className="text-gray-600">
            Support these campaigns to bring films to your local cinema
          </p>
        </div>

        {campaigns.map((campaign) => {
          const progress = getCampaignProgress(campaign)
          const progressClasses = getProgressBarClasses(progress)

          return (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <Card className="group transition-colors hover:border-gray-400">
                <CardHeader>
                  <CardTitle className="group-hover:text-gray-600">
                    {campaign.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        ({progress.timeLeft.days} days left)
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
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
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
