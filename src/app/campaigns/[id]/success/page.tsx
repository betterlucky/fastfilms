import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { settings } from '@/lib/settings'

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { ticketIds?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/')
  }

  const ticketIds = searchParams.ticketIds?.split(',') || []
  if (!ticketIds.length) {
    redirect('/')
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      venue: true,
    },
  })

  if (!campaign) {
    redirect('/')
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      id: { in: ticketIds },
      userId: session.user.id,
    },
    include: {
      purchase: {
        include: {
          orders: {
            include: {
              menuItem: true,
              choices: {
                include: {
                  option: true,
                  selectedChoice: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!tickets.length) {
    redirect('/')
  }

  const formattedDate = new Date(campaign.screeningDate).toLocaleDateString(
    'en-GB',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  )

  const formattedTime = new Date(campaign.screeningDate).toLocaleTimeString(
    'en-GB',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  )

  // Calculate totals
  const regularTickets = tickets.filter(t => t.status === 'CONFIRMED')
  const pifTickets = tickets.filter(t => t.status === 'PAY_IT_FORWARD')
  const ticketsSubtotal = tickets.reduce((sum, ticket) => sum + Number(ticket.pricePaid), 0)
  const menuTotal = tickets[0].purchase?.orders.reduce((sum, order) => {
    const itemTotal = Number(order.menuItem.price) * order.quantity
    const optionsTotal = order.choices.reduce((optSum, choice) => 
      optSum + Number(choice.selectedChoice.priceAdjustment || 0), 0)
    return sum + itemTotal + optionsTotal
  }, 0) || 0
  const transactionFee = settings.transactionFee
  const grandTotal = ticketsSubtotal + menuTotal + transactionFee

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{campaign.title}</h2>
              <p className="text-gray-600">
                {formattedDate} at {formattedTime}
              </p>
              <p className="text-gray-600">{campaign.venue.name}</p>
            </div>

            <div>
              <h3 className="font-medium">Your Tickets</h3>
              <div className="space-y-2 text-gray-600">
                {regularTickets.length > 0 && (
                  <p>
                    {regularTickets.length} Regular Tickets at £{Number(regularTickets[0].pricePaid).toFixed(2)} each
                    (£{(regularTickets.length * Number(regularTickets[0].pricePaid)).toFixed(2)})
                  </p>
                )}
                {pifTickets.length > 0 && (
                  <p>
                    {pifTickets.length} Pay It Forward Tickets at £{Number(pifTickets[0].pricePaid).toFixed(2)} each
                    (£{(pifTickets.length * Number(pifTickets[0].pricePaid)).toFixed(2)})
                  </p>
                )}
                <p className="text-sm text-gray-500">Total: {tickets.length} tickets</p>
              </div>
            </div>

            {tickets[0].purchase?.orders.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium">Pre-ordered Items</h3>
                <ul className="list-inside list-disc space-y-2 text-gray-600">
                  {tickets[0].purchase.orders.map((order) => (
                    <li key={order.id} className="space-y-1">
                      <div>
                        {order.quantity}x {order.menuItem.name} at £{Number(order.menuItem.price).toFixed(2)} each
                        (£{(order.quantity * Number(order.menuItem.price)).toFixed(2)})
                      </div>
                      {order.choices.length > 0 && (
                        <ul className="ml-6 list-inside list-disc text-sm">
                          {order.choices.map((choice) => (
                            <li key={choice.id}>
                              {choice.option.name}: {choice.selectedChoice.name}
                              {Number(choice.selectedChoice.priceAdjustment) > 0 && 
                                ` (+£${Number(choice.selectedChoice.priceAdjustment).toFixed(2)})`}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tickets Subtotal:</span>
                  <span>£{ticketsSubtotal.toFixed(2)}</span>
                </div>
                {menuTotal > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Food & Drinks Total:</span>
                    <span>£{menuTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Transaction Fee:</span>
                  <span>£{transactionFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-medium">
                  <span>Grand Total:</span>
                  <span>£{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500">
                A confirmation email has been sent to your email address.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button asChild variant="outline">
                <Link href="/tickets">View My Tickets</Link>
              </Button>
              <Button asChild>
                <Link href="/campaigns">Browse More Campaigns</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
