'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { FaTicketAlt, FaUtensils } from 'react-icons/fa'
import { settings } from '@/lib/settings'

interface Order {
  id: string
  createdAt: string
  totalAmount: number | string
  status: string
  campaign: {
    id: string
    movieTitle: string
    screeningDate: string
    venue: {
      name: string
    }
  }
  tickets: {
    id: string
    status: string
    pricePaid: number | string
  }[]
  orders: {
    id: string
    quantity: number
    menuItem: {
      name: string
      price: number | string
    }
    choices: {
      selectedChoices: {
        name: string
        priceAdjustment: number
      }[]
      option: {
        name: string
      }
    }[]
  }[]
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Helper function to format currency
  const formatPrice = (price: number | string): string => {
    try {
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(numericPrice)
    } catch (err) {
      console.error('Error formatting price:', err)
      return '£0.00'
    }
  }

  // Helper function to calculate total for menu items including choices
  const calculateMenuItemTotal = (item: Order['orders'][0]): number => {
    const basePrice = Number(item.menuItem.price)
    const choicesAdjustment = item.choices.reduce((sum, choice) => 
      sum + choice.selectedChoices.reduce((choiceSum, c) => choiceSum + Number(c.priceAdjustment), 0), 0)
    return (basePrice + choicesAdjustment) * item.quantity
  }

  // Helper function to calculate order breakdown
  const calculateOrderBreakdown = (order: Order) => {
    const standardTickets = order.tickets.filter(t => t.status === 'CONFIRMED')
    const pifTickets = order.tickets.filter(t => t.status === 'PAY_IT_FORWARD')
    
    const ticketsSubtotal = standardTickets.reduce((sum, ticket) => 
      sum + Number(ticket.pricePaid), 0)
    
    const pifSubtotal = pifTickets.reduce((sum, ticket) => 
      sum + Number(ticket.pricePaid), 0)
    
    const menuSubtotal = order.orders.reduce((sum, item) => 
      sum + calculateMenuItemTotal(item), 0)
    
    const transactionFee = settings.transactionFee // Fee per transaction, not per ticket
    const calculatedTotal = ticketsSubtotal + pifSubtotal + menuSubtotal + transactionFee
    const actualTotal = Number(order.totalAmount)

    // Log detailed breakdown for debugging
    console.log('Order Breakdown:', {
      orderId: order.id,
      standardTickets: standardTickets.length,
      standardTicketPrice: standardTickets[0]?.pricePaid,
      ticketsSubtotal,
      pifTickets: pifTickets.length,
      pifTicketPrice: pifTickets[0]?.pricePaid,
      pifSubtotal,
      menuItems: order.orders.map(item => ({
        name: item.menuItem.name,
        basePrice: item.menuItem.price,
        quantity: item.quantity,
        choices: item.choices.map(c => ({
          option: c.option.name,
          choice: c.selectedChoices.map(c => c.name).join(', '),
          adjustment: c.selectedChoices.reduce((sum, c) => sum + Number(c.priceAdjustment), 0)
        })),
        total: calculateMenuItemTotal(item)
      })),
      menuSubtotal,
      transactionFee,
      calculatedTotal,
      actualTotal,
      difference: actualTotal - calculatedTotal
    })

    return {
      ticketsSubtotal,
      pifSubtotal,
      menuSubtotal,
      transactionFee,
      total: actualTotal // Use the actual total from the purchase
    }
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/user/orders')
        if (!response.ok) throw new Error('Failed to fetch orders')
        const data = await response.json()
        setOrders(data)
      } catch (err) {
        setError('Failed to load orders. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center">
        <p className="text-red-600">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-6 text-center">
        <p className="text-gray-500">You haven't made any orders yet.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/campaigns')}
        >
          Browse Campaigns
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const screeningDate = new Date(order.campaign.screeningDate)
        screeningDate.setHours(screeningDate.getHours() + 1) // Adjust for UK timezone
        const formattedDate = screeningDate.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        const formattedTime = screeningDate.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })

        const standardTickets = order.tickets.filter(t => t.status === 'CONFIRMED')
        const pifTickets = order.tickets.filter(t => t.status === 'PAY_IT_FORWARD')
        const breakdown = calculateOrderBreakdown(order)

        return (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{order.campaign.movieTitle}</h3>
                  <p className="text-sm text-gray-500">
                    {formattedDate} at {formattedTime}
                  </p>
                  <p className="text-sm text-gray-500">{order.campaign.venue.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  </p>
                  <p className="font-semibold">{formatPrice(breakdown.total)}</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {/* Tickets */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <FaTicketAlt className="size-4" />
                    <span>Tickets</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {standardTickets.length > 0 && (
                      <p className="text-sm">
                        {standardTickets.length} Standard Ticket{standardTickets.length > 1 ? 's' : ''} - {formatPrice(standardTickets[0].pricePaid)} each
                      </p>
                    )}
                    {pifTickets.length > 0 && (
                      <p className="text-sm">
                        {pifTickets.length} Pay It Forward Ticket{pifTickets.length > 1 ? 's' : ''} - {formatPrice(pifTickets[0].pricePaid)} each
                      </p>
                    )}
                  </div>
                </div>

                {/* Food & Drinks */}
                {order.orders.length > 0 && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <FaUtensils className="size-4" />
                      <span>Food & Drinks</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      {order.orders.map((item) => (
                        <div key={item.id} className="text-sm">
                          <p>
                            {item.quantity}x {item.menuItem.name} - {formatPrice(calculateMenuItemTotal(item))}
                          </p>
                          {item.choices.length > 0 && (
                            <ul className="ml-4 mt-1 list-disc text-gray-500">
                              {item.choices.map((choice) => (
                                <li key={choice.option.name}>
                                  {choice.option.name}: {choice.selectedChoices.map(c => c.name).join(', ')}
                                  {choice.selectedChoices.some(c => Number(c.priceAdjustment) > 0) && (
                                    ` (+${formatPrice(choice.selectedChoices.reduce((sum, c) => sum + Number(c.priceAdjustment), 0))})`
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-900">Order Summary</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {breakdown.ticketsSubtotal > 0 && (
                      <div className="flex justify-between">
                        <span>Tickets Subtotal:</span>
                        <span>{formatPrice(breakdown.ticketsSubtotal)}</span>
                      </div>
                    )}
                    {breakdown.pifSubtotal > 0 && (
                      <div className="flex justify-between">
                        <span>Pay It Forward Tickets:</span>
                        <span>{formatPrice(breakdown.pifSubtotal)}</span>
                      </div>
                    )}
                    {breakdown.menuSubtotal > 0 && (
                      <div className="flex justify-between">
                        <span>Food & Drinks:</span>
                        <span>{formatPrice(breakdown.menuSubtotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Transaction Fee:</span>
                      <span>{formatPrice(breakdown.transactionFee)}</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-medium text-gray-900">
                      <span>Total:</span>
                      <span>{formatPrice(breakdown.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/campaigns/${order.campaign.id}`)}
                >
                  View Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 