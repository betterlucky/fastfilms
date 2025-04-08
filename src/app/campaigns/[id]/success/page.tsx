import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
      orders: {
        include: {
          menuItem: true,
        },
      },
    },
  })

  if (!tickets.length) {
    redirect('/')
  }

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
                {new Date(campaign.screeningDate).toLocaleDateString()} at{' '}
                {campaign.screeningTime}
              </p>
              <p className="text-gray-600">{campaign.venue.name}</p>
            </div>

            <div>
              <h3 className="font-medium">Your Tickets</h3>
              <p className="text-gray-600">{tickets.length} tickets booked</p>
              {tickets[0].orders.length > 0 && (
                <div className="mt-2">
                  <h3 className="font-medium">Pre-ordered Items</h3>
                  <ul className="list-inside list-disc text-gray-600">
                    {tickets[0].orders.map((order) => (
                      <li key={order.id}>
                        {order.quantity}x {order.menuItem.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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