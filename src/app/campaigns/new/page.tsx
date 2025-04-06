import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import NewCampaignForm from "@/components/new-campaign-form"

export const dynamic = 'force-dynamic'

export default async function NewCampaignPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/campaigns")
  }

  const venues = await prisma.venue.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Create New Screening</h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Start a new film screening campaign in your community
          </p>
        </div>
        <NewCampaignForm venues={venues} />
      </div>
    </div>
  )
} 