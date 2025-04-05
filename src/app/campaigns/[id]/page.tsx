import { prisma } from "@/lib/db"
import { formatPrice, formatDate, calculateProgress, calculateTimeLeft } from "@/lib/utils"
import { notFound } from "next/navigation"
import { ContributionForm } from "@/components/contribution-form"
import { TicketForm } from "@/components/ticket-form"

async function getCampaign(id: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      venue: {
        include: {
          menuItems: {
            include: {
              options: true,
            },
          },
        },
      },
    },
  })

  if (!campaign) {
    notFound()
  }

  return campaign
}

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function CampaignPage({ params }: PageProps) {
  const resolvedParams = await params
  const campaign = await getCampaign(resolvedParams.id)

  const progress = calculateProgress(Number(campaign.currentFunding), Number(campaign.fundingTarget))
  const timeLeft = calculateTimeLeft(campaign.deadlineDate)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
        <div className="px-4 sm:px-0 md:col-span-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {campaign.movieTitle}
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {campaign.description}
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium leading-6 text-gray-900">Venue</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">{campaign.venue.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium leading-6 text-gray-900">Screening Date</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">
                {new Date(campaign.screeningDate).toLocaleDateString("en-GB", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium leading-6 text-gray-900">Funding Progress</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">
                £{Number(campaign.currentFunding).toFixed(2)} of £{Number(campaign.fundingTarget).toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium leading-6 text-gray-900">Campaign Deadline</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700">
                {new Date(campaign.deadlineDate).toLocaleDateString("en-GB", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>

        {/* Contribution and ticket forms */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Support this screening</h2>
            <div className="mt-4">
              <ContributionForm
                campaignId={campaign.id}
                currentFunding={Number(campaign.currentFunding)}
                fundingTarget={Number(campaign.fundingTarget)}
              />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Purchase tickets</h2>
            <div className="mt-4">
              <TicketForm
                campaignId={campaign.id}
                ticketPrice={5}
                menuItems={campaign.venue.menuItems}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 