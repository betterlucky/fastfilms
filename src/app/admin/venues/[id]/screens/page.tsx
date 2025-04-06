import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AddScreenForm from "@/app/admin/venues/[id]/screens/AddScreenForm"

interface Screen {
  id: string;
  name: string;
  capacity: number;
  createdAt: Date;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  url: string | null;
  phone: string | null;
}

export default async function VenueScreensPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  // Get venue with screens
  const [venue] = await prisma.$queryRaw<Venue[]>`
    SELECT id, name, address, city, postcode, url, phone
    FROM "Venue"
    WHERE id = ${params.id}
  `;

  if (!venue) {
    return <div>Venue not found</div>
  }

  // Get screens for the venue
  const screens = await prisma.$queryRaw<Screen[]>`
    SELECT id, name, capacity, "createdAt"
    FROM "Screen"
    WHERE "venueId" = ${params.id}
    ORDER BY name ASC
  `;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{venue.name} - Screens</h1>
          <p className="text-gray-500">{venue.address}, {venue.city}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Screens</h2>
          <div className="space-y-4">
            {screens.map((screen) => (
              <Card key={screen.id}>
                <CardHeader>
                  <CardTitle>{screen.name}</CardTitle>
                  <CardDescription>Capacity: {screen.capacity} seats</CardDescription>
                </CardHeader>
              </Card>
            ))}
            {screens.length === 0 && (
              <p className="text-gray-500">No screens added yet</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Screen</h2>
          <AddScreenForm venueId={params.id} />
        </div>
      </div>
    </div>
  )
} 