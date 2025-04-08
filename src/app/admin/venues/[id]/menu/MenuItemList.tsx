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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

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
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<SerializedMenuItem | null>(null)

  const groupedItems = menuItems.reduce(
    (groups, item) => {
      const group = groups[item.category] || []
      group.push(item)
      return { ...groups, [item.category]: group }
    },
    {} as Record<string, SerializedMenuItem[]>
  )

  const handleDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(
        `/api/admin/venues/${venueId}/menu/${itemToDelete.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete menu item')
      }

      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      })
      
      // Refresh the page to show updated list
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

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
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                      <p className="mt-1 font-medium">
                        £{item.price.toFixed(2)}
                      </p>
                    </div>
                    {item.options.length > 0 && (
                      <div className="ml-8">
                        <h5 className="text-sm font-medium">Options:</h5>
                        <ul className="mt-1 space-y-1 text-sm text-gray-500">
                          {item.options.map((option) => (
                            <li key={option.id}>{option.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

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
                    <Dialog open={itemToDelete?.id === item.id} onOpenChange={(open) => !open && setItemToDelete(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setItemToDelete(item)}
                        >
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Menu Item</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{item.name}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setItemToDelete(null)}
                            disabled={isDeleting}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
