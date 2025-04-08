'use client'

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

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

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      const ticketId = searchParams.get('ticketId');
      if (!ticketId) {
        setError('No ticket ID provided');
        return;
      }

      try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch ticket');
        }
        const data = await response.json();
        setTicket(data);
      } catch (err) {
        setError('Failed to load ticket details');
      }
    };

    fetchTicket();
  }, [searchParams]);

  if (error) {
    return (
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <main>
            <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
              <h1 className="font-bold text-3xl text-gray-900 tracking-tight">
                Error
              </h1>
              <p>{error}</p>
              <div className="items-center justify-center flex mt-10 gap-x-6">
                <Button
                  onClick={() => router.push('/campaigns')}
                  className="px-3.5 py-2.5 hover:bg-indigo-500 font-semibold text-sm text-white bg-indigo-600 rounded-md shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Browse Campaigns
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <main>
            <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
              <h1 className="font-bold text-3xl text-gray-900 tracking-tight">
                Loading...
              </h1>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <main>
          <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <h1 className="font-bold text-3xl text-gray-900 tracking-tight">
              Thank you for your purchase!
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Your ticket has been confirmed and sent to your email address.
            </p>

            <div className="mt-6">
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <dl className="flex flex-wrap">
                  <div className="flex-auto pl-6 pt-6">
                    <dt className="font-medium text-sm text-gray-900">Ticket ID</dt>
                    <dd className="mt-1 text-sm text-gray-500">{ticket.id}</dd>
                  </div>
                  <div className="flex-auto pl-6 pt-6">
                    <dt className="font-medium text-sm text-gray-900">Movie</dt>
                    <dd className="mt-1 text-sm text-gray-500">
                      {ticket.campaign.movieTitle}
                    </dd>
                  </div>
                  <div className="flex-auto pl-6 pt-6">
                    <dt className="font-medium text-sm text-gray-900">Venue</dt>
                    <dd className="mt-1 text-sm text-gray-500">
                      {ticket.campaign.venue.name}
                    </dd>
                  </div>

                  <div className="flex flex-none px-6 pb-6 mt-4 gap-x-4 w-full">
                    <dt>
                      <svg className="size-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </dt>
                    <dd className="text-sm text-gray-900 leading-6">
                      {new Date(ticket.screeningDate).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="items-center justify-center flex mt-10 gap-x-6">
              <Button
                onClick={() => router.push('/campaigns')}
                className="px-3.5 py-2.5 hover:bg-indigo-500 font-semibold text-sm text-white bg-indigo-600 rounded-md shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Browse More Campaigns
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/tickets')}
                className="font-semibold text-sm text-gray-900"
              >
                View My Tickets
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <main>
            <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
              <h1 className="font-bold text-3xl text-gray-900 tracking-tight">
                Loading...
              </h1>
            </div>
          </main>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
} 