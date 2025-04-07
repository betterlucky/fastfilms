import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db"
import { CampaignForm } from "./campaign-form"

export default async function NewCampaignPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    redirect("/")
  }

  const venues = await prisma.venue.findMany({
    include: {
      screens: true,
      menuItems: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  const charities = await prisma.charity.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Create New Campaign</h1>
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignForm venues={venues} charities={charities} />
        </CardContent>
      </Card>
    </div>
  )
} 