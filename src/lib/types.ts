import { Decimal } from '@prisma/client/runtime/library'

export interface OrderChoice {
  optionId: string
  selectedChoiceId: string
  option?: {
    name: string
  }
  selectedChoice?: {
    name: string
  }
}

export interface OrderWithMenuItem {
  id: string
  createdAt: Date
  updatedAt: Date
  purchaseId: string
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

export interface EmailData {
  movieTitle: string
  venueName: string
  screeningDate: Date
  ticketQuantity: number
  totalAmount: number
  regularTickets?: number
  pifTickets?: number
  ticketPrice?: number
  foodOrders?: Array<{
    name: string
    quantity: number
    price: number
    options?: Array<{
      name: string
      choice: string
    }>
  }>
}
