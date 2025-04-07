import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Manage Venues",
  description: "Manage cinema venues",
}

export default async function VenuesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const venues = await prisma.venue.findMany({
    include: {
      _count: {
        select: {
          campaigns: true,
          screens: true,
        },
      },
    },
  })

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Venues</h1>
        <Button asChild>
          <Link href="/admin/venues/new">Add Venue</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={venues} />
    </div>
  )
} 