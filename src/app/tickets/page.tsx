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
      <div className="py-24 bg-white sm:py-32">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 bg-white sm:py-32">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">Something went wrong</h2>
            <p className="mt-2 text-lg text-gray-600 leading-8">
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
      <div className="py-24 bg-white sm:py-32">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <TicketIcon className="mx-auto size-12 text-gray-400" />
            <h2 className="mt-4 font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">No tickets yet</h2>
            <p className="mt-2 text-lg text-gray-600 leading-8">
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
    <div className="py-24 bg-white sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">
            My Tickets
          </h2>
          <p className="mt-2 text-lg text-gray-600 leading-8">
            View and manage your upcoming screenings.
          </p>
        </div>

        <div className="space-y-8 mt-16">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="ring-1 ring-gray-900/5 p-6 bg-white rounded-lg shadow-sm"
            >
              <dl className="flex flex-wrap">
                <div className="flex-auto pl-6 pt-6">
                  <dt className="font-semibold text-sm text-gray-900 leading-6">Movie</dt>
                  <dd className="mt-1 font-semibold text-base text-gray-900 leading-6">
                    {ticket.campaign.movieTitle}
                  </dd>
                </div>
                <div className="self-end flex-none px-6 pt-4">
                  <dt className="sr-only">Status</dt>
                  <dd className="ring-1 ring-inset ring-green-600/20 px-2 py-1 font-medium text-xs text-green-700 bg-green-50 rounded-md">
                    Confirmed
                  </dd>
                </div>
                <div className="flex flex-none px-6 pt-6 mt-6 gap-x-4 w-full border-t border-gray-900/5">
                  <dt>
                    <svg className="w-5 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </dt>
                  <dd className="text-sm text-gray-900 leading-6">{ticket.campaign.venue.name}</dd>
                </div>
                <div className="flex flex-none px-6 pb-6 mt-4 gap-x-4 w-full">
                  <dt>
                    <svg className="w-5 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </dt>
                  <dd className="text-sm text-gray-900 leading-6">
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