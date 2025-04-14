import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/app/admin/campaigns/[id]/purchases/columns'
import { Decimal } from '@prisma/client/runtime/library'

// Helper function to convert Decimal to number
const convertDecimal = (value: Decimal | null | undefined) => {
  if (!value) return 0
  return Number(value)
}

export default async function CampaignPurchasesPage({
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
      purchases: {
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
        },
        where: {
          status: 'CONFIRMED',
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          purchases: {
            where: {
              status: 'CONFIRMED',
            },
          },
        },
      },
    },
  })

  if (!campaign) {
    redirect('/admin/campaigns')
  }

  // Process purchases with their tickets and orders
  const processedPurchases = campaign.purchases.map((purchase) => ({
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
      choices: order.choices.map(choice => ({
        option: {
          name: choice.option.name
        },
        selectedChoices: choice.selectedChoices.map(sc => ({
          name: sc.name,
          priceAdjustment: convertDecimal(sc.priceAdjustment)
        }))
      }))
    })),
  }))

  // Calculate statistics
  const totalPurchases = campaign._count.purchases
  const totalRevenue = processedPurchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  )
  const totalTickets = processedPurchases.reduce(
    (sum, purchase) => sum + purchase.tickets.length,
    0
  )
  const payItForwardTickets = processedPurchases.reduce(
    (sum, purchase) =>
      sum + purchase.tickets.filter((t) => t.status === 'PAY_IT_FORWARD').length,
    0
  )
  const standardTickets = processedPurchases.reduce(
    (sum, purchase) =>
      sum + purchase.tickets.filter((t) => t.status === 'CONFIRMED').length,
    0
  )
  const totalPreOrders = processedPurchases.reduce(
    (sum, purchase) => sum + purchase.orders.length,
    0
  )

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Campaign Purchases</h1>
          <Button variant="outline" asChild>
            <Link href="/admin/campaigns">Back to Campaigns</Link>
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPurchases}</div>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pre-orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPreOrders}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={processedPurchases} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 