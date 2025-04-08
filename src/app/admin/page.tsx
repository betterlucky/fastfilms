import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SendCampaignGuestList } from "@/components/admin/send-campaign-guest-list"
import { prisma } from "@/lib/db"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage your cinema crowdfunding platform",
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  // Get counts for dashboard
  const [campaigns, venues, charities, tickets, users] = await Promise.all([
    prisma.campaign.count(),
    prisma.venue.count(),
    prisma.charity.count(),
    prisma.ticket.count({
      where: {
        status: "CONFIRMED",
        campaign: {
          screeningDate: {
            gte: new Date(),
          },
        },
      },
    }),
    prisma.user.count(),
  ])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{campaigns}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{venues}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Charities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{charities}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tickets}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SendCampaignGuestList />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Add recent activity feed */}
            <p className="text-muted-foreground">Activity feed coming soon</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/campaigns">View All Campaigns</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/campaigns/new">Create Campaign</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Venue Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/venues">View All Venues</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/venues/new">Add Venue</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charity Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/charities">View All Charities</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/charities/new">Add Charity</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-2xl font-bold">{users}</p>
              <span className="text-sm text-muted-foreground">Total Users</span>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 