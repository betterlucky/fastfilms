import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Decimal } from '@prisma/client/runtime/library'

// Helper function to convert Decimal to number
const convertDecimal = (value: Decimal | null | undefined) => {
  if (!value) return 0
  return Number(value)
}

export default async function CampaignTicketsPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      tickets: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          campaign: {
            select: {
              title: true,
              movieTitle: true,
              screeningDate: true,
            },
          },
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
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  })

  if (!campaign) {
    redirect('/admin/campaigns')
  }

  // Convert Decimal values to numbers in tickets and orders
  const processedTickets = campaign.tickets.map(ticket => ({
    ...ticket,
    pricePaid: convertDecimal(ticket.pricePaid),
    orders: ticket.purchase?.orders.map(order => ({
      ...order,
      menuItem: order.menuItem ? {
        ...order.menuItem,
        price: convertDecimal(order.menuItem.price)
      } : null
    })) || []
  }))

  // Calculate ticket statistics
  const totalTickets = campaign._count.tickets
  const totalRevenue = processedTickets.reduce(
    (sum, ticket) => sum + ticket.pricePaid,
    0
  )
  const payItForwardTickets = processedTickets.filter(
    (ticket) => ticket.status === 'PAY_IT_FORWARD'
  ).length
  const standardTickets = processedTickets.filter(
    (ticket) => ticket.status === 'CONFIRMED'
  ).length

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Campaign Tickets</h1>
          <Button variant="outline" asChild>
            <Link href="/admin/campaigns">Back to Campaigns</Link>
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTickets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Standard Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{standardTickets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pay It Forward
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payItForwardTickets}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={processedTickets} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
