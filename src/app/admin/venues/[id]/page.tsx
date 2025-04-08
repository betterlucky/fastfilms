import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function VenuePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return notFound()
  }

  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
    include: {
      screens: true,
      campaigns: true,
    },
  })

  if (!venue) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{venue.name}</h1>
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
                <p>
                  {venue.city}, {venue.postcode}
                </p>
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
            <div className="mb-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {venue.screens.length} screen
                {venue.screens.length !== 1 ? 's' : ''}
              </p>
              <Button asChild>
                <Link href={`/admin/venues/${venue.id}/screens`}>
                  Manage Screens
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {venue.campaigns.length} campaign
                {venue.campaigns.length !== 1 ? 's' : ''}
              </p>
              <Button asChild>
                <Link href={`/admin/venues/${venue.id}/campaigns`}>
                  View Campaigns
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
