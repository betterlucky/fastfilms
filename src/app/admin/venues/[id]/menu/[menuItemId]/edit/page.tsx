import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MenuItemForm from "../../MenuItemForm"
import { notFound } from "next/navigation"

export default async function EditMenuItemPage({ params }: { params: { id: string; menuItemId: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    return notFound()
  }

  const venue = await prisma.venue.findUnique({
    where: { id: params.id },
    include: {
      menuItems: {
        where: { id: params.menuItemId },
        include: {
          options: {
            include: {
              choices: true,
            },
          },
        },
      },
    },
  })

  if (!venue || !venue.menuItems.length) {
    redirect("/admin/venues")
  }

  const menuItem = venue.menuItems[0]

  return (
    <div className="space-y-8">
      <h1 className="font-bold text-3xl">Edit Menu Item for {venue.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Menu Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuItemForm
            venueId={venue.id}
            initialData={{
              id: menuItem.id,
              name: menuItem.name,
              description: menuItem.description,
              price: Number(menuItem.price),
              category: menuItem.category,
              isActive: menuItem.isActive,
              options: menuItem.options.map(option => ({
                id: option.id,
                name: option.name,
                description: option.description || undefined,
                minChoices: option.minChoices,
                maxChoices: option.maxChoices,
                choices: option.choices.map(choice => ({
                  id: choice.id,
                  name: choice.name,
                  priceAdjustment: Number(choice.priceAdjustment),
                })),
              })),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
} 