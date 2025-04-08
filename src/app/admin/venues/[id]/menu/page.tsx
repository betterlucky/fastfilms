import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import MenuItemList from "./MenuItemList"

export default async function VenueMenuPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
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
    redirect("/admin/venues")
  }

  return (
    <div className="space-y-8">
      <div className="justify-between items-center flex">
        <h1 className="font-bold text-3xl">Menu Items for {venue.name}</h1>
        <Button asChild>
          <Link href={`/admin/venues/${venue.id}/menu/new`}>Add New Menu Item</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuItemList venueId={venue.id} menuItems={venue.menuItems} />
        </CardContent>
      </Card>
    </div>
  )
} 