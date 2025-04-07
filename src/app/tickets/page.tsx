'use client'

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TicketIcon } from "lucide-react";

interface Ticket {
  id: string;
  campaign: {
    movieTitle: string;
    venue: {
      name: string;
    };
  };
  screeningDate: string;
}

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/tickets');
        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }
        const data = await response.json();
        setTickets(data || []);
      } catch (err) {
        setError('Something went wrong while loading your tickets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Something went wrong</h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              {error}
            </p>
            <div className="mt-10">
              <Button onClick={() => router.push('/campaigns')}>
                Browse Campaigns
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">No tickets yet</h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              You haven't booked any tickets yet. Check out our upcoming screenings!
            </p>
            <div className="mt-10">
              <Button onClick={() => router.push('/campaigns')}>
                Browse Campaigns
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            My Tickets
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            View and manage your upcoming screenings.
          </p>
        </div>

        <div className="mt-16 space-y-8">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5"
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
                  <dd className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Confirmed
                  </dd>
                </div>
                <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
                  <dt>
                    <svg className="h-6 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </dt>
                  <dd className="text-sm leading-6 text-gray-900">{ticket.campaign.venue.name}</dd>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 px-6 pb-6">
                  <dt>
                    <svg className="h-6 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </dt>
                  <dd className="text-sm leading-6 text-gray-900">
                    {new Date(ticket.screeningDate).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 