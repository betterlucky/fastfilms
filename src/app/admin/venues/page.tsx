import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function VenuesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const venues = await prisma.venue.findMany({
    orderBy: {
      name: 'asc'
    },
    include: {
      _count: {
        select: {
          screens: true
        }
      }
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Venues</h1>
        <Button asChild>
          <Link href="/admin/venues/new">Add New Venue</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map((venue) => (
          <Card key={venue.id}>
            <CardHeader>
              <CardTitle>{venue.name}</CardTitle>
              <CardDescription>{venue.city}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-500">{venue.address}</p>
              <p className="text-sm text-gray-500">{venue.postcode}</p>
              <p className="text-sm text-gray-500">Screens: {venue._count.screens}</p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/admin/venues/${venue.id}/features`}
                >
                  Features
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/admin/venues/${venue.id}/menu`}
                >
                  Manage Menu
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/admin/venues/${venue.id}/screens`}
                >
                  Manage Screens
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/admin/venues/${venue.id}/edit`}
                >
                  Edit Venue
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 