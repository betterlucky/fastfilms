'use client'

import { MenuItem, MenuItemOption, MenuItemOptionChoice } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import Link from 'next/link'

// Type for serialized menu items with numbers instead of Decimal
interface SerializedMenuItemOptionChoice extends Omit<MenuItemOptionChoice, 'priceAdjustment'> {
  priceAdjustment: number
}

interface SerializedMenuItemOption extends Omit<MenuItemOption, 'choices'> {
  choices: SerializedMenuItemOptionChoice[]
}

interface SerializedMenuItem extends Omit<MenuItem, 'price'> {
  price: number
  options: SerializedMenuItemOption[]
}

interface MenuItemListProps {
  venueId: string
  menuItems: SerializedMenuItem[]
}

export default function MenuItemList({
  venueId,
  menuItems,
}: MenuItemListProps) {
  const router = useRouter()
  const groupedItems = menuItems.reduce(
    (groups, item) => {
      const group = groups[item.category] || []
      group.push(item)
      return { ...groups, [item.category]: group }
    },
    {} as Record<string, SerializedMenuItem[]>
  )

  return (
    <div className="space-y-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Menu Items</h1>
        <Button
          onClick={() => router.push(`/admin/venues/${venueId}/menu/new`)}
        >
          Add Item
        </Button>
      </div>
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category}>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {category}
          </h3>
          <div className="grid gap-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                  <p className="mt-2 text-lg font-semibold">
                    £{item.price.toFixed(2)}
                  </p>

                  {item.options.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Options:</p>
                      {item.options.map((option) => (
                        <div key={option.id} className="text-sm text-gray-500">
                          <p>{option.name}</p>
                          <ul className="ml-2 list-inside list-disc">
                            {option.choices.map((choice) => (
                              <li key={choice.id}>
                                {choice.name}
                                {choice.priceAdjustment > 0 && (
                                  <span className="text-green-600">
                                    {' '}
                                    (+£{choice.priceAdjustment.toFixed(2)})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/venues/${venueId}/menu/${item.id}/edit`)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/admin/venues/${venueId}/menu/${item.id}/delete`
                        )
                      }
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
