'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Venue } from '@prisma/client'

export const columns: ColumnDef<
  Venue & { _count: { campaigns: number; screens: number } }
>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    accessorKey: '_count.campaigns',
    header: 'Campaigns',
  },
  {
    accessorKey: '_count.screens',
    header: 'Screens',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const venue = row.original

      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/venues/${venue.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/venues/${venue.id}/menu`}>Menu</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/venues/${venue.id}/screens`}>Screens</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              if (
                confirm(
                  'Are you sure you want to delete this venue? This action cannot be undone.'
                )
              ) {
                try {
                  const response = await fetch(
                    `/api/admin/venues/${venue.id}`,
                    {
                      method: 'DELETE',
                    }
                  )

                  if (response.ok) {
                    window.location.reload()
                  } else {
                    const error = await response.text()
                    alert(error)
                  }
                } catch (error) {
                  alert('Failed to delete venue')
                }
              }
            }}
          >
            Delete
          </Button>
        </div>
      )
    },
  },
]
