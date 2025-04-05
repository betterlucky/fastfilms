import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function TicketsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      campaign: {
        include: {
          venue: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            My Tickets
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            View and manage your tickets for upcoming screenings.
          </p>

          <div className="mt-16 space-y-8">
            {tickets.length === 0 ? (
              <p className="text-gray-500">You haven't purchased any tickets yet.</p>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5"
                >
                  <dl className="flex flex-wrap">
                    <div className="flex-auto pl-6 pt-6">
                      <dt className="text-sm font-semibold leading-6 text-gray-900">Movie</dt>
                      <dd className="mt-1 text-base font-semibold leading-6 text-gray-900">
                        {ticket.campaign.movieTitle}
                      </dd>
                    </div>
                    <div className="flex-none self-end px-6 pt-4">
                      <dt className="sr-only">Status</dt>
                      <dd className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        ticket.status === "CONFIRMED"
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : ticket.status === "PENDING"
                          ? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                          : "bg-red-50 text-red-700 ring-red-600/20"
                      }`}>
                        {ticket.status}
                      </dd>
                    </div>
                    <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
                      <dt className="flex-none">
                        <span className="sr-only">Venue</span>
                        <svg className="h-6 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                        </svg>
                      </dt>
                      <dd className="text-sm leading-6 text-gray-900">{ticket.campaign.venue.name}</dd>
                    </div>
                    <div className="mt-4 flex w-full flex-none gap-x-4 px-6 pb-6">
                      <dt className="flex-none">
                        <span className="sr-only">Date</span>
                        <svg className="h-6 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      </dt>
                      <dd className="text-sm leading-6 text-gray-900">
                        {new Date(ticket.campaign.screeningDate).toLocaleDateString("en-GB", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 