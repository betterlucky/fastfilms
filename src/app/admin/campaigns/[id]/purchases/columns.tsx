'use client'

import { ColumnDef } from '@tanstack/react-table'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AllocateTicketDialog } from '../tickets/allocate-ticket-dialog'
import { ResetTicketDialog } from '../tickets/reset-ticket-dialog'
import { ResendConfirmationButton } from '@/components/resend-confirmation-button'
import Link from 'next/link'

interface Ticket {
  id: string
  status: string
  pricePaid: number
}

interface Order {
  menuItem: {
    name: string
    price: number
  }
  quantity: number
  choices: Array<{
    option: { name: string }
    selectedChoice: { name: string }
  }>
}

interface Purchase {
  id: string
  user: {
    name: string
    email: string
  }
  totalAmount: number
  tickets: Ticket[]
  orders: Order[]
  createdAt: Date
}

export const columns: ColumnDef<Purchase>[] = [
  {
    accessorKey: 'user.name',
    header: 'Customer Name',
  },
  {
    accessorKey: 'user.email',
    header: 'Email',
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => {
      const amount = row.getValue('totalAmount') as number
      return `£${amount.toFixed(2)}`
    },
  },
  {
    accessorKey: 'tickets',
    header: 'Tickets',
    cell: ({ row }) => {
      const tickets = row.getValue('tickets') as Ticket[]
      const standardTickets = tickets.filter(t => t.status === 'CONFIRMED')
      const pifTickets = tickets.filter(t => t.status === 'PAY_IT_FORWARD')
      
      return (
        <div className="space-y-1">
          {standardTickets.length > 0 && (
            <div className="text-sm">
              {standardTickets.length} Standard Ticket{standardTickets.length > 1 ? 's' : ''} - £{standardTickets[0].pricePaid.toFixed(2)} each
            </div>
          )}
          {pifTickets.length > 0 && (
            <div className="text-sm">
              {pifTickets.length} Pay It Forward Ticket{pifTickets.length > 1 ? 's' : ''} - £{pifTickets[0].pricePaid.toFixed(2)} each
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'orders',
    header: 'Pre-orders',
    cell: ({ row }) => {
      const orders = row.getValue('orders') as Order[]
      const totalItems = orders.reduce((sum, order) => sum + order.quantity, 0)
      return (
        <div>
          <div className="text-sm">{totalItems} item{totalItems !== 1 ? 's' : ''}</div>
          <Link 
            href={`/admin/campaigns/${row.original.id}/order-details`}
            className="text-xs text-blue-600 hover:underline"
          >
            View Details
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Purchase Date',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return formatDate(date)
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const purchase = row.original
      const pifTickets = purchase.tickets.filter(t => t.status === 'PAY_IT_FORWARD')
      const standardTickets = purchase.tickets.filter(t => t.status === 'CONFIRMED')

      return (
        <div className="flex gap-2">
          {pifTickets.length > 0 && (
            <AllocateTicketDialog
              ticket={pifTickets[0]}
              purchaseId={purchase.id}
              maxTickets={pifTickets.length}
            />
          )}
          {standardTickets.length > 0 && (
            <ResetTicketDialog
              ticket={standardTickets[0]}
              purchaseId={purchase.id}
              maxTickets={standardTickets.length}
            />
          )}
          <ResendConfirmationButton
            ticketIds={purchase.tickets.map(t => t.id)}
          />
        </div>
      )
    },
  },
] 