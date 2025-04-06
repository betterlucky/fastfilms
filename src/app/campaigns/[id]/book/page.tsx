import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCampaign } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import Image from "next/image"
import BookingForm from "./BookingForm"

export default async function BookPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const campaign = await getCampaign(params.id)

  if (!campaign) {
    return <div>Campaign not found</div>
  }

  if (!session?.user) {
    redirect(`/login?callbackUrl=/campaigns/${params.id}/book`)
  }

  const formattedDate = new Date(campaign.screeningDate).toLocaleDateString("en-GB", {
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
            <CardHeader>
              <CardTitle>Book Tickets for {campaign.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Screening Details</h2>
                    <p>{formattedDate} at {campaign.screeningTime}</p>
                    <p className="text-gray-500">{campaign.venue.name}</p>
                    <p className="text-gray-500">{campaign.venue.address}, {campaign.venue.city}, {campaign.venue.postcode}</p>
                    {campaign.screen && (
                      <p className="text-gray-500">Screen: {campaign.screen.name} ({campaign.screen.capacity} seats)</p>
                    )}
                  </div>

                  <BookingForm 
                    campaignId={campaign.id}
                    maxTickets={Math.min(10, campaign.ticketCap - campaign.currentTickets)}
                    charity={campaign.charity}
                    menuItems={campaign.menuItems || []}
                  />
                </div>

                <div>
                  {campaign.posterPath && (
                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${campaign.posterPath}`}
                        alt={campaign.movieTitle}
                        fill
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
    </div>
  )
} 