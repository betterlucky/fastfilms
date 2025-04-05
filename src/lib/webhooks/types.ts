import { Order, MenuItem, Ticket } from "@prisma/client"

export interface WebhookHandlerResponse {
  received: boolean
  error?: string
  status?: number
}

export interface OrderChoice {
  optionId: string
  selectedChoice: string
}

export interface OrderWithMenuItem extends Order {
  menuItem: MenuItem
  choices: OrderChoice[]
}

export interface TicketWithOrders extends Ticket {
  orders: OrderWithMenuItem[]
} 