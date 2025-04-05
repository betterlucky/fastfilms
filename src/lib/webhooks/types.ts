import { Order, MenuItem, Ticket, Prisma } from "@prisma/client"

export interface WebhookHandlerResponse {
  received: boolean
  error?: string
  status?: number
}

export interface OrderChoice {
  optionId: string
  selectedChoice: string
}

export interface OrderWithMenuItem extends Omit<Order, 'choices'> {
  menuItem: MenuItem
  choices: OrderChoice[]
}

export interface TicketWithOrders extends Ticket {
  orders: OrderWithMenuItem[]
} 