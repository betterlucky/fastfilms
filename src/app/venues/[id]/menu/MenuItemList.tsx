import { MenuItem, MenuItemOption, MenuItemOptionChoice } from '@prisma/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MenuItemWithOptions extends MenuItem {
  options: (MenuItemOption & {
    choices: MenuItemOptionChoice[]
  })[]
}

interface MenuItemListProps {
  venueId: string
  menuItems: MenuItemWithOptions[]
}

export default function MenuItemList({
  venueId,
  menuItems,
}: MenuItemListProps) {
  const groupedItems = menuItems.reduce(
    (groups, item) => {
      const group = groups[item.category] || []
      group.push(item)
      return { ...groups, [item.category]: group }
    },
    {} as Record<string, MenuItemWithOptions[]>
  )

  return (
    <div className="space-y-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Menu Items</h1>
        <Button
          onClick={() => (window.location.href = `/venues/${venueId}/menu/new`)}
        >
          Add Item
        </Button>
      </div>
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category}>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {category}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm text-gray-500">
                    {item.description}
                  </p>
                  <p className="mb-4 text-sm font-medium">
                    £{Number(item.price).toFixed(2)}
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
                                {Number(choice.priceAdjustment) > 0 && (
                                  <span className="text-green-600">
                                    {' '}
                                    (+£
                                    {Number(choice.priceAdjustment).toFixed(2)})
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
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/venues/${venueId}/menu/${item.id}/edit`}>
                        Edit
                      </Link>
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
