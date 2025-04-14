import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Decimal } from '@prisma/client/runtime/library'

// Helper function to convert Decimal to number
const convertDecimal = (value: Decimal | null | undefined) => {
  if (!value) return 0
  return Number(value)
}

export default async function OrderDetailsPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      tickets: true,
      orders: {
        include: {
          menuItem: true,
          choices: {
            include: {
              option: true,
              selectedChoices: true,
            },
          },
        },
      },
      campaign: {
        include: {
          venue: true,
        },
      },
    },
  })

  if (!purchase) {
    redirect('/admin/campaigns')
  }

  // Process purchase data
  const processedPurchase = {
    ...purchase,
    totalAmount: convertDecimal(purchase.totalAmount),
    tickets: purchase.tickets.map((ticket) => ({
      ...ticket,
      pricePaid: convertDecimal(ticket.pricePaid),
    })),
    orders: purchase.orders.map((order) => ({
      ...order,
      menuItem: {
        ...order.menuItem,
        price: convertDecimal(order.menuItem.price),
      },
    })),
  }

  // Calculate totals
  const standardTickets = processedPurchase.tickets.filter(t => t.status === 'CONFIRMED')
  const pifTickets = processedPurchase.tickets.filter(t => t.status === 'PAY_IT_FORWARD')
  const ticketsSubtotal = processedPurchase.tickets.reduce((sum, ticket) => sum + ticket.pricePaid, 0)
  const menuTotal = processedPurchase.orders.reduce((sum, order) => {
    const itemTotal = order.menuItem.price * order.quantity
    const optionsTotal = order.choices.reduce((optSum, choice) => 
      optSum + Number(choice.selectedChoices.reduce((sum, c) => sum + Number(c.priceAdjustment), 0)), 0)
    return sum + itemTotal + optionsTotal
  }, 0)

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <Button variant="outline" asChild>
            <Link href={`/admin/campaigns/${purchase.campaignId}/purchases`}>
              Back to Purchases
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {processedPurchase.user.name}</p>
              <p><strong>Email:</strong> {processedPurchase.user.email}</p>
              <p><strong>Purchase Date:</strong> {new Date(processedPurchase.createdAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Movie:</strong> {processedPurchase.campaign.movieTitle}</p>
              <p><strong>Venue:</strong> {processedPurchase.campaign.venue.name}</p>
              <p><strong>Screening Date:</strong> {new Date(processedPurchase.campaign.screeningDate).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {standardTickets.length > 0 && (
                <div>
                  <h3 className="font-medium">Standard Tickets</h3>
                  <p>{standardTickets.length} x £{standardTickets[0].pricePaid.toFixed(2)} = £{(standardTickets.length * standardTickets[0].pricePaid).toFixed(2)}</p>
                </div>
              )}
              {pifTickets.length > 0 && (
                <div>
                  <h3 className="font-medium">Pay It Forward Tickets</h3>
                  <p>{pifTickets.length} x £{pifTickets[0].pricePaid.toFixed(2)} = £{(pifTickets.length * pifTickets[0].pricePaid).toFixed(2)}</p>
                </div>
              )}
              <div className="border-t pt-2">
                <p><strong>Ticket Subtotal:</strong> £{ticketsSubtotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {processedPurchase.orders.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pre-orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedPurchase.orders.map((order) => (
                  <div key={order.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{order.menuItem.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                        {order.choices.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Options:</p>
                            <ul className="ml-4 list-disc text-sm">
                              {order.choices.map((choice) => (
                                <li key={choice.id}>
                                  {choice.option.name}: {choice.selectedChoices.map(c => c.name).join(', ')}
                                  {choice.selectedChoices.some(c => Number(c.priceAdjustment) > 0) && 
                                    ` (+£${choice.selectedChoices.reduce((sum, c) => sum + Number(c.priceAdjustment), 0).toFixed(2)})`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p>£{(order.menuItem.price * order.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2">
                  <p><strong>Pre-order Subtotal:</strong> £{menuTotal.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p>Tickets:</p>
                <p>£{ticketsSubtotal.toFixed(2)}</p>
              </div>
              {processedPurchase.orders.length > 0 && (
                <div className="flex justify-between">
                  <p>Pre-orders:</p>
                  <p>£{menuTotal.toFixed(2)}</p>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <p>Total:</p>
                  <p>£{processedPurchase.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 