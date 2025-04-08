'use client'

import { ColumnDef } from '@tanstack/react-table'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AllocateTicketDialog } from './allocate-ticket-dialog'
import { ResetTicketDialog } from './reset-ticket-dialog'
import { ResendConfirmationButton } from '@/components/resend-confirmation-button'

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'user.name',
    header: 'Customer Name',
  },
  {
    accessorKey: 'user.email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className="capitalize">
          {status === 'CONFIRMED' ? 'Standard' : 'Pay It Forward'}
        </div>
      )
    },
  },
  {
    accessorKey: 'pricePaid',
    header: 'Price Paid',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('pricePaid') as string)
      return `£${amount.toFixed(2)}`
    },
  },
  {
    accessorKey: 'orders',
    header: 'Menu Items',
    cell: ({ row }) => {
      const orders = row.getValue('orders') as Array<{
        menuItem: { name: string }
        choices: Array<{
          id: string
          selectedChoice: { name: string }
        }>
      }>
      return (
        <div>
          {orders.map((order, i) => (
            <div key={i} className="text-sm">
              {order.menuItem.name}
              {order.choices.map((choice) => (
                <span key={choice.id} className="text-muted-foreground">
                  {' '}
                  ({choice.selectedChoice.name})
                </span>
              ))}
            </div>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Purchase Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt') as string)
      return formatDate(date)
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const ticket = row.original
      const isPIF = ticket.status === 'PAY_IT_FORWARD'

      return (
        <div className="flex gap-2">
          {isPIF ? (
            <AllocateTicketDialog ticket={ticket} />
          ) : (
            <ResetTicketDialog ticket={ticket} />
          )}
          <ResendConfirmationButton ticketId={ticket.id} />
        </div>
      )
    },
  },
]
