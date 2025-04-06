import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { handleUpdateVenue } from "./actions"

async function getVenues() {
  return prisma.venue.findMany({
    include: {
      screens: true,
    },
  })
}

export default async function VenuesPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === "ADMIN"
  const venues = await getVenues()

  if (!isAdmin) {
    return <div>Unauthorized</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Venues</CardTitle>
                <Link href="/venues/new">
                  <Button>Create New Venue</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {venues.map((venue) => (
                  <div key={venue.id} className="p-4 border rounded-lg">
                    <form action={handleUpdateVenue} className="space-y-4">
                      <input type="hidden" name="venueId" value={venue.id} />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`name-${venue.id}`} className="block text-sm font-medium text-gray-700">
                            Venue Name
                          </label>
                          <Input
                            type="text"
                            name="name"
                            id={`name-${venue.id}`}
                            defaultValue={venue.name}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label htmlFor={`address-${venue.id}`} className="block text-sm font-medium text-gray-700">
                            Address
                          </label>
                          <Input
                            type="text"
                            name="address"
                            id={`address-${venue.id}`}
                            defaultValue={venue.address}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label htmlFor={`city-${venue.id}`} className="block text-sm font-medium text-gray-700">
                            City
                          </label>
                          <Input
                            type="text"
                            name="city"
                            id={`city-${venue.id}`}
                            defaultValue={venue.city}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label htmlFor={`postcode-${venue.id}`} className="block text-sm font-medium text-gray-700">
                            Postcode
                          </label>
                          <Input
                            type="text"
                            name="postcode"
                            id={`postcode-${venue.id}`}
                            defaultValue={venue.postcode}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label htmlFor={`url-${venue.id}`} className="block text-sm font-medium text-gray-700">
                            Website
                          </label>
                          <Input
                            type="url"
                            name="website"
                            id={`url-${venue.id}`}
                            defaultValue={venue.url}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label htmlFor={`phone-${venue.id}`} className="block text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <Input
                            type="tel"
                            name="phone"
                            id={`phone-${venue.id}`}
                            defaultValue={venue.phone}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {venue.screens.length} screen{venue.screens.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex space-x-2">
                          <Button type="submit">Update Venue</Button>
                          <Link
                            href={`/venues/${venue.id}/screens`}
                            className="btn-primary"
                          >
                            Manage Screens
                          </Link>
                          <Link
                            href={`/venues/${venue.id}/menu`}
                            className="btn-primary"
                          >
                            Manage Menu
                          </Link>
                        </div>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 