import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

export default async function CampaignTicketsPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
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
            }
          },
          orders: {
            include: {
              menuItem: true,
              choices: {
                include: {
                  option: true,
                  selectedChoice: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          tickets: true
        }
      }
    }
  })

  if (!campaign) {
    redirect("/admin/campaigns")
  }

  // Calculate ticket statistics
  const totalTickets = campaign._count.tickets
  const totalRevenue = campaign.tickets.reduce((sum, ticket) => sum + Number(ticket.pricePaid), 0)
  const payItForwardTickets = campaign.tickets.filter(ticket => ticket.status === 'PAY_IT_FORWARD').length
  const standardTickets = campaign.tickets.filter(ticket => ticket.status === 'CONFIRMED').length

  return (
    <div className="container py-10 mx-auto">
      <div className="max-w-7xl mx-auto">
        <div className="justify-between items-center flex mb-6">
          <h1 className="font-bold text-3xl">Campaign Tickets</h1>
          <Button variant="outline" asChild>
            <Link href="/admin/campaigns">Back to Campaigns</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 mb-6 gap-6">
          <Card>
            <CardHeader className="items-center justify-between flex flex-row space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Total Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{totalTickets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="items-center justify-between flex flex-row space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">£{totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="items-center justify-between flex flex-row space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Standard Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{standardTickets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="items-center justify-between flex flex-row space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Pay It Forward</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{payItForwardTickets}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={campaign.tickets} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 