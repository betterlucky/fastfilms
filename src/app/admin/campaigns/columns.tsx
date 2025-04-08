"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Campaign } from "@prisma/client"
import { formatDate } from "@/lib/utils"

export const columns: ColumnDef<Campaign & {
  venue: { name: string }
  charity: { name: string } | null
  _count: { tickets: number }
}>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const campaign = row.original
      return (
        <div className="items-center flex space-x-2">
          <span>{campaign.title}</span>
          {campaign.isTest && (
            <span className="px-2 py-1 font-medium text-xs text-yellow-800 bg-yellow-100 rounded-full">
              Test Mode
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "movieTitle",
    header: "Movie",
  },
  {
    accessorKey: "venue.name",
    header: "Venue",
  },
  {
    accessorKey: "charity.name",
    header: "Charity",
  },
  {
    accessorKey: "screeningDate",
    header: "Screening Date",
    cell: ({ row }) => formatDate(row.original.screeningDate),
  },
  {
    accessorKey: "_count.tickets",
    header: "Tickets",
  },
  {
    accessorKey: "currentFunding",
    header: "Funding",
    cell: ({ row }) => `£${row.original.currentFunding.toFixed(2)}`,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const campaign = row.original

      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/campaigns/${campaign.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/campaigns/${campaign.id}/tickets`}>Tickets</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              if (confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
                try {
                  const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
                    method: "DELETE",
                  })

                  if (response.ok) {
                    window.location.reload()
                  } else {
                    const error = await response.text()
                    alert(error)
                  }
                } catch (error) {
                  alert("Failed to delete campaign")
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