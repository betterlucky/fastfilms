import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import MenuItemList from "./MenuItemList"

export default async function VenueMenuPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === "ADMIN"
  
  if (!isAdmin) {
    return <div>Unauthorized</div>
  }

  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
    include: {
      menuItems: {
        include: {
          options: {
            include: {
              choices: true
            }
          }
        },
        orderBy: {
          category: 'asc'
        }
      }
    }
  })

  if (!venue) {
    redirect("/venues")
  }

  return (
    <div className="container py-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <div className="justify-between items-center flex">
                <CardTitle>Menu Items for {venue.name}</CardTitle>
                <Link href={`/venues/${venue.id}/menu/new`}>
                  <Button>Add New Menu Item</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <MenuItemList venueId={venue.id} menuItems={venue.menuItems} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 