import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { Ticket, Campaign, Venue } from "@prisma/client"
import { formatDate } from "@/lib/utils"
import { LocalizedDate } from "@/components/LocalizedDate"
import { Button } from "@/components/ui/button"

type TicketWithDetails = Ticket & {
  campaign: Campaign & {
    venue: Venue
  }
}

export const dynamic = 'force-dynamic'

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { ids?: string }
}) {
  if (!searchParams.ids) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="bg-white">
            <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                No tickets found
              </h1>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ticketIds = searchParams.ids.split(",")
  const tickets = await prisma.ticket.findMany({
    where: {
      id: {
        in: ticketIds,
      },
    },
    include: {
      campaign: {
        include: {
          venue: true,
        },
      },
    },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="bg-white">
          <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Order successful!
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Your tickets have been confirmed. We've sent you an email with all the details.
            </p>

            <div className="mt-16">
              <h2 className="sr-only">Tickets</h2>

              <div className="space-y-8">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border-t border-b border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border"
                  >
                    <dl className="flex flex-wrap">
                      <div className="flex-auto pl-6 pt-6">
                        <dt className="text-sm font-medium text-gray-900">Ticket ID</dt>
                        <dd className="mt-1 text-sm text-gray-500">{ticket.id}</dd>
                      </div>
                      <div className="flex-auto pl-6 pt-6">
                        <dt className="text-sm font-medium text-gray-900">Movie</dt>
                        <dd className="mt-1 text-sm text-gray-500">
                          {ticket.campaign.movieTitle}
                        </dd>
                      </div>
                      <div className="flex-auto pl-6 pt-6">
                        <dt className="text-sm font-medium text-gray-900">Venue</dt>
                        <dd className="mt-1 text-sm text-gray-500">
                          {ticket.campaign.venue.name}
                        </dd>
                      </div>

                      <div className="mt-4 flex w-full flex-none gap-x-4 px-6 pb-6">
                        <dt className="flex-none">
                          <span className="sr-only">Date</span>
                          <svg className="h-6 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                        </dt>
                        <dd className="text-sm leading-6 text-gray-900">
                          <LocalizedDate date={formatDate(ticket.campaign.screeningDate)} />
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button
                onClick={() => window.location.href = "/campaigns"}
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Browse More Campaigns
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.href = "/tickets"}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                View All Tickets <span aria-hidden="true">→</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 