import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function VenuePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return notFound()
  }

  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
    include: {
      screens: true,
      campaigns: true,
    }
  })

  if (!venue) {
    return notFound()
  }

  return (
    <div className="container py-6 mx-auto">
      <div className="justify-between items-center flex mb-6">
        <h1 className="font-bold text-3xl">{venue.name}</h1>
        <Button asChild>
          <Link href={`/admin/venues/${venue.id}/edit`}>Edit Venue</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Venue Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold">Address</h3>
                <p>{venue.address}</p>
                <p>{venue.city}, {venue.postcode}</p>
              </div>
              <div>
                <h3 className="font-semibold">Contact</h3>
                <p>Email: {venue.contactEmail}</p>
                <p>Phone: {venue.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Screens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="justify-between items-center flex mb-4">
              <p className="text-sm text-muted-foreground">
                {venue.screens.length} screen{venue.screens.length !== 1 ? "s" : ""}
              </p>
              <Button asChild>
                <Link href={`/admin/venues/${venue.id}/screens`}>Manage Screens</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="justify-between items-center flex mb-4">
              <p className="text-sm text-muted-foreground">
                {venue.campaigns.length} campaign{venue.campaigns.length !== 1 ? "s" : ""}
              </p>
              <Button asChild>
                <Link href={`/admin/venues/${venue.id}/campaigns`}>View Campaigns</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 