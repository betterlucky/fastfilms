import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { handleAddScreen, handleUpdateScreen, handleDeleteScreen } from "./actions"

async function getVenue(id: string) {
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: {
      screens: true,
    },
  })

  if (!venue) {
    throw new Error("Venue not found")
  }

  return venue
}

export default async function VenueScreensPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === "ADMIN"
  const venue = await getVenue(params.id)

  if (!isAdmin) {
    return <div>Unauthorized</div>
  }

  return (
    <div className="container py-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Screens for {venue.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add New Screen Form */}
                <form action={handleAddScreen} className="space-y-4">
                  <input type="hidden" name="venueId" value={venue.id} />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block font-medium text-sm text-gray-700">
                        Screen Name
                      </label>
                      <Input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="capacity" className="block font-medium text-sm text-gray-700">
                        Capacity
                      </label>
                      <Input
                        type="number"
                        name="capacity"
                        id="capacity"
                        required
                        min={1}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button type="submit">Add Screen</Button>
                </form>

                {/* Existing Screens */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Existing Screens</h3>
                  {venue.screens.map((screen) => (
                    <div key={screen.id} className="items-center justify-between flex p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{screen.name}</h4>
                        <p className="text-sm text-gray-500">Capacity: {screen.capacity}</p>
                      </div>
                      <div className="flex space-x-2">
                        <form action={handleUpdateScreen}>
                          <input type="hidden" name="screenId" value={screen.id} />
                          <input type="hidden" name="venueId" value={venue.id} />
                          <div className="flex space-x-2">
                            <Input
                              type="text"
                              name="name"
                              defaultValue={screen.name}
                              className="w-32"
                            />
                            <Input
                              type="number"
                              name="capacity"
                              defaultValue={screen.capacity}
                              min={1}
                              className="w-24"
                            />
                            <Button type="submit">Update</Button>
                          </div>
                        </form>
                        <form action={handleDeleteScreen}>
                          <input type="hidden" name="screenId" value={screen.id} />
                          <input type="hidden" name="venueId" value={venue.id} />
                          <Button type="submit" variant="destructive">Delete</Button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 