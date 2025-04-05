import { prisma } from "@/lib/db"
import { formatPrice, formatDate, calculateProgress, calculateTimeLeft } from "@/lib/utils"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.isAdmin

  // If not admin, find and redirect to featured campaign
  if (!isAdmin) {
    const featuredCampaign = await prisma.campaign.findFirst({
      where: {
        isFeatured: true,
        status: "ACTIVE",
      },
    })

    if (featuredCampaign) {
      redirect(`/campaigns/${featuredCampaign.id}`)
    }
  }

  const campaigns = await prisma.campaign.findMany({
    include: {
      venue: true,
    },
    orderBy: {
      deadlineDate: "asc",
    },
    where: {
      status: "ACTIVE",
    },
  })

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Active Campaigns</h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Support these upcoming film screenings in your community
          </p>
          {isAdmin && (
            <div className="mt-4">
              <Link
                href="/campaigns/new"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Create New Campaign
              </Link>
            </div>
          )}
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const progress = calculateProgress(Number(campaign.currentFunding), Number(campaign.fundingTarget))
            const timeLeft = calculateTimeLeft(campaign.deadlineDate)
            
            return (
              <article key={campaign.id} className="flex flex-col items-start">
                <div className="w-full">
                  <div className="flex items-center gap-x-4 text-xs">
                    <time dateTime={campaign.deadlineDate.toISOString()} className="text-gray-500">
                      {timeLeft.days} days left
                    </time>
                    <div className="relative flex items-center gap-x-4">
                      <div className="text-gray-500">{campaign.venue.name}</div>
                    </div>
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                      <Link href={`/campaigns/${campaign.id}`}>
                        <span className="absolute inset-0" />
                        {campaign.movieTitle}
                      </Link>
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{campaign.description}</p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-500">{formatPrice(Number(campaign.currentFunding))} raised</span>
                      <span className="text-gray-500">{formatPrice(Number(campaign.fundingTarget))} goal</span>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        {campaigns.length === 0 && (
          <p className="mt-16 text-center text-gray-500">No active campaigns at the moment.</p>
        )}
      </div>
    </div>
  )
} 