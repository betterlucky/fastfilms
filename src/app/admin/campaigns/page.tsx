import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
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
          id: true,
          name: true,
          city: true,
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

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Button asChild>
          <Link href="/admin/campaigns/new">Create Campaign</Link>
        </Button>
      </div>

      <DataTable columns={columns} data={campaigns} />
    </div>
  )
}
