import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Manage Campaigns',
  description: 'Manage cinema crowdfunding campaigns',
}

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const campaigns = await prisma.campaign.findMany({
    include: {
      venue: {
        select: {
          name: true,
        },
      },
      charity: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          tickets: true,
        },
      },
    },
    orderBy: {
      screeningDate: 'asc',
    },
  })

  const liveCampaigns = campaigns.filter((campaign) => !campaign.isTest)
  const testCampaigns = campaigns.filter((campaign) => campaign.isTest)

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Button asChild>
          <Link href="/admin/campaigns/new">Create Campaign</Link>
        </Button>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">Live Campaigns</TabsTrigger>
          <TabsTrigger value="test">Test Campaigns</TabsTrigger>
        </TabsList>
        <TabsContent value="live">
          <DataTable columns={columns} data={liveCampaigns} />
        </TabsContent>
        <TabsContent value="test">
          <DataTable columns={columns} data={testCampaigns} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
