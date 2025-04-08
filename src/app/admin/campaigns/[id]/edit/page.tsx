import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CampaignEditForm } from "./campaign-edit-form"

export default async function CampaignEditPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const [campaign, venues, charities] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id },
      include: {
        venue: {
          include: {
            screens: true,
            menuItems: {
              where: { isActive: true },
              orderBy: { category: 'asc' }
            }
          }
        },
        menuItems: {
          include: {
            menuItem: true
          }
        },
        charity: true,
      }
    }),
    prisma.venue.findMany({
      include: {
        screens: true,
        menuItems: {
          where: { isActive: true },
          orderBy: { category: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.charity.findMany({
      orderBy: { name: 'asc' }
    })
  ])

  if (!campaign) {
    redirect("/admin/campaigns")
  }

  return (
    <div className="container py-10 mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="justify-between items-center flex mb-6">
          <h1 className="font-bold text-3xl">Edit Campaign</h1>
          <Button variant="outline" asChild>
            <Link href="/admin/campaigns">Back to Campaigns</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{campaign.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CampaignEditForm 
              campaign={campaign}
              venues={venues}
              charities={charities}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 