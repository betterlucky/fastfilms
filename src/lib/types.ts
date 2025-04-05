import { Decimal } from "@prisma/client/runtime/library"

export interface OrderChoice {
  optionId: string
  selectedChoice: string
}

export interface OrderWithMenuItem {
  id: string
  createdAt: Date
  updatedAt: Date
  ticketId: string
  menuItemId: string
  quantity: number
  choices: OrderChoice[]
  menuItem: {
    id: string
    name: string
    type: string
    description: string
    price: Decimal
    venueId: string
    createdAt: Date
    updatedAt: Date
  }
}

export interface TicketWithOrders {
  id: string
  createdAt: Date
  updatedAt: Date
  status: string
  userId: string
  campaignId: string
  orders: OrderWithMenuItem[]
  campaign: {
    id: string
    title: string
    description: string
    movieTitle: string
    screeningDate: Date
    venue: {
      id: string
      name: string
    }
  }
}

export interface EmailData {
  movieTitle: string
  venueName: string
  screeningDate: Date
  ticketQuantity: number
  totalAmount: number
} 