import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MenuItemForm from "../../MenuItemForm"

export default async function EditMenuItemPage({ params }: { params: { id: string; menuItemId: string } }) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === "ADMIN"
  
  if (!isAdmin) {
    return <div>Unauthorized</div>
  }

  const [venue, menuItem] = await Promise.all([
    prisma.venue.findUnique({
      where: { id: params.id },
    }),
    prisma.menuItem.findUnique({
      where: { id: params.menuItemId },
      include: {
        options: {
          include: {
            choices: true,
          },
        },
      },
    }),
  ])

  if (!venue || !menuItem || menuItem.venueId !== venue.id) {
    redirect("/venues")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Menu Item for {venue.name}</CardTitle>
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
                  options: menuItem.options.map((option, index) => ({
                    id: option.id,
                    name: option.name,
                    description: option.description || undefined,
                    minChoices: option.minChoices,
                    maxChoices: option.maxChoices,
                    order: index,
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
      </div>
    </div>
  )
} 