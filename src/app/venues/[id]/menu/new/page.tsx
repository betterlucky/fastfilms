import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MenuItemForm from "../MenuItemForm"

export default async function NewMenuItemPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === "ADMIN"
  
  if (!isAdmin) {
    return <div>Unauthorized</div>
  }

  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
  })

  if (!venue) {
    redirect("/venues")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Add Menu Item for {venue.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <MenuItemForm venueId={venue.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 