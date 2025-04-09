'use client'

import { ColumnDef } from '@tanstack/react-table'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AllocateTicketDialog } from '../tickets/allocate-ticket-dialog'
import { ResetTicketDialog } from '../tickets/reset-ticket-dialog'
import { ResendConfirmationButton } from '@/components/resend-confirmation-button'

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
      return (
        <div>
          {tickets.map((ticket, i) => (
            <div key={i} className="text-sm">
              {ticket.status === 'CONFIRMED' ? 'Standard' : 'Pay It Forward'} - £
              {ticket.pricePaid.toFixed(2)}
            </div>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: 'orders',
    header: 'Pre-orders',
    cell: ({ row }) => {
      const orders = row.getValue('orders') as Order[]
      return (
        <div>
          {orders.map((order, i) => (
            <div key={i} className="text-sm">
              {order.menuItem.name} x{order.quantity} - £
              {(order.menuItem.price * order.quantity).toFixed(2)}
              {order.choices.map((choice, j) => (
                <div key={j} className="ml-2 text-xs text-gray-500">
                  {choice.option.name}: {choice.selectedChoice.name}
                </div>
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
            />
          )}
          {standardTickets.length > 0 && (
            <ResetTicketDialog
              ticket={standardTickets[0]}
              purchaseId={purchase.id}
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