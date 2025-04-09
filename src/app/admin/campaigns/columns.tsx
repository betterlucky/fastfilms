'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Campaign } from '@prisma/client'
import { formatDate } from '@/lib/utils'

export const columns: ColumnDef<
  Campaign & {
    venue: { id: string; name: string; city: string }
    charity: { name: string } | null
    _count: { tickets: number }
  }
>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const campaign = row.original
      return (
        <div className="flex items-center space-x-2">
          <span>{campaign.title}</span>
          {campaign.isTest && (
            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              Test Mode
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'movieTitle',
    header: 'Movie',
  },
  {
    accessorKey: 'venue',
    header: 'Venue',
    cell: ({ row }) => {
      const venue = row.original.venue
      return (
        <div>
          <div className="font-medium">{venue.name}</div>
          <div className="text-sm text-gray-500">{venue.city}</div>
        </div>
      )
    },
  },
  {
    accessorKey: 'charity.name',
    header: 'Charity',
  },
  {
    accessorKey: 'screeningDate',
    header: 'Screening Date',
    cell: ({ row }) => formatDate(row.original.screeningDate),
  },
  {
    accessorKey: '_count.tickets',
    header: 'Tickets',
  },
  {
    accessorKey: 'currentFunding',
    header: 'Funding',
    cell: ({ row }) => `£${row.original.currentFunding.toFixed(2)}`,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const campaign = row.original

      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/campaigns/${campaign.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/campaigns/${campaign.id}/purchases`}>
              Purchases
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/campaigns/${campaign.id}`}>Book</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              if (
                confirm(
                  'Are you sure you want to delete this campaign? This action cannot be undone.'
                )
              ) {
                try {
                  const endpoint = campaign.isTest 
                    ? `/api/admin/campaigns/cleanup-test`
                    : `/api/admin/campaigns/${campaign.id}`

                  const response = await fetch(endpoint, {
                    method: campaign.isTest ? 'POST' : 'DELETE',
                    headers: campaign.isTest ? { 'Content-Type': 'application/json' } : undefined,
                    body: campaign.isTest ? JSON.stringify({ campaignId: campaign.id }) : undefined,
                  })

                  if (response.ok) {
                    const data = await response.json()
                    if (data.statistics) {
                      alert(`Campaign deleted successfully.\n\nStatistics:\n` +
                        `Tickets: ${data.statistics.tickets}\n` +
                        `Purchases: ${data.statistics.purchases}\n` +
                        `Orders: ${data.statistics.orders}\n` +
                        `Order Choices: ${data.statistics.orderChoices}\n` +
                        `Menu Items: ${data.statistics.menuItems}`)
                    }
                    window.location.reload()
                  } else {
                    const error = await response.text()
                    alert(error)
                  }
                } catch (error) {
                  alert('Failed to delete campaign')
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
