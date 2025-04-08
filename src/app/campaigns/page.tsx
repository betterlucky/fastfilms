import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CalendarIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getCampaigns } from '@/lib/campaigns'

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
}

export default async function CampaignsPage() {
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
                <div className="relative">
                  {campaign.isTest && (
                    <div className="absolute -right-[4.5rem] top-6 z-10 w-[200px] rotate-45 bg-red-500 py-2 text-center text-sm font-semibold text-white shadow-lg">
                      TEST CAMPAIGN
                    </div>
                  )}
                  <p className="text-gray-600">{campaign.description}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <CalendarIcon className="mr-2 size-4" />
                    <span>
                      {new Date(campaign.screeningDate).toLocaleDateString()} -{' '}
                      {new Date(campaign.deadlineDate).toLocaleDateString()}
                    </span>
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
