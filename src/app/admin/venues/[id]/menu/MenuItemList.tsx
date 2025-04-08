'use client'

import { MenuItem, MenuItemOption, MenuItemOptionChoice } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

interface MenuItemWithOptions extends MenuItem {
  options: (MenuItemOption & {
    choices: MenuItemOptionChoice[]
  })[]
}

interface MenuItemListProps {
  venueId: string
  menuItems: MenuItemWithOptions[]
}

export default function MenuItemList({ venueId, menuItems }: MenuItemListProps) {
  const router = useRouter()
  const groupedItems = menuItems.reduce((groups, item) => {
    const category = item.category || 'Uncategorized'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
    return groups
  }, {} as Record<string, MenuItemWithOptions[]>)

  return (
    <div className="space-y-8">
      <div className="items-center justify-between flex mb-8">
        <h1 className="font-bold text-3xl">Menu Items</h1>
        <Button 
          onClick={() => router.push(`/admin/venues/${venueId}/menu/new`)}
        >
          Add Item
        </Button>
      </div>
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category}>
          <h2 className="mb-4 font-bold text-2xl">{category}</h2>
          <div className="grid gap-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                  <p className="mt-2 font-semibold text-lg">£{item.price.toFixed(2)}</p>
                  
                  {item.options.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Options:</p>
                      {item.options.map((option) => (
                        <div key={option.id} className="text-sm text-gray-500">
                          <p>{option.name}</p>
                          <ul className="list-disc list-inside ml-2">
                            {option.choices.map((choice) => (
                              <li key={choice.id}>
                                {choice.name}
                                {Number(choice.priceAdjustment) > 0 && (
                                  <span className="text-green-600"> (+£{Number(choice.priceAdjustment).toFixed(2)})</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex mt-4 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/admin/venues/${venueId}/menu/${item.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/admin/venues/${venueId}/menu/${item.id}/delete`)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 