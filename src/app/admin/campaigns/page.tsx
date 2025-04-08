import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Manage Campaigns",
  description: "Manage cinema crowdfunding campaigns",
}

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
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
      screeningDate: "asc",
    },
  })

  return (
    <div className="container py-10 mx-auto">
      <div className="justify-between items-center flex mb-6">
        <h1 className="font-bold text-3xl">Campaigns</h1>
        <Button asChild>
          <Link href="/admin/campaigns/new">Create Campaign</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={campaigns} />
    </div>
  )
} 