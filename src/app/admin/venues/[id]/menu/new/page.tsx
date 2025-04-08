import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MenuItemForm from "../MenuItemForm"
import { notFound } from "next/navigation"

export default async function NewMenuItemPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    return notFound()
  }

  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
  })

  if (!venue) {
    redirect("/admin/venues")
  }

  return (
    <div className="space-y-8">
      <h1 className="font-bold text-3xl">Add Menu Item for {venue.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Menu Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuItemForm venueId={venue.id} />
        </CardContent>
      </Card>
    </div>
  )
} 