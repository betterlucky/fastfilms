'use client'

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Campaign {
  id: string;
  title: string;
  movieTitle: string;
  description: string;
  posterUrl: string | null;
  venue: {
    name: string;
  };
  currentTickets: number;
  ticketCap: number;
  formattedDate: string;
  timeLeft: {
    days: number;
  };
  formattedTarget: string;
  formattedCurrent: string;
  progress: number;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns');
        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }
        const data = await response.json();
        setCampaigns(data);
      } catch (err) {
        setError('Failed to load campaigns');
      }
    };

    fetchCampaigns();
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Error
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Current Campaigns
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Support and attend community film screenings across Cornwall.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <article
              key={campaign.id}
              className="flex flex-col items-start justify-between"
            >
              <div className="relative w-full">
                {campaign.posterUrl ? (
                  <img
                    src={campaign.posterUrl}
                    alt={campaign.movieTitle}
                    className="aspect-[2/3] w-full rounded-2xl bg-gray-100 object-cover"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center rounded-2xl bg-gray-100">
                    <span className="text-gray-500">No poster available</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
              </div>
              <div className="max-w-xl">
                <div className="mt-8 flex items-center gap-x-4 text-xs">
                  <time dateTime={campaign.formattedDate} className="text-gray-500">
                    {campaign.formattedDate}
                  </time>
                  <span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600">
                    {campaign.venue.name}
                  </span>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                    <a href={`/campaigns/${campaign.id}`}>
                      <span className="absolute inset-0" />
                      {campaign.movieTitle}
                    </a>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                    {campaign.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-x-4">
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-gray-900">
                        {campaign.currentTickets} tickets sold
                      </p>
                      <p className="text-gray-600">
                        {campaign.timeLeft.days} days left
                      </p>
                    </div>
                  </div>
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-gray-900">
                      {campaign.formattedCurrent} raised
                    </p>
                    <p className="text-gray-600">
                      of {campaign.formattedTarget} target
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${
                        campaign.progress >= 100
                          ? campaign.currentTickets >= campaign.ticketCap
                            ? "bg-red-500"
                            : "bg-green-500"
                          : "bg-indigo-600"
                      }`}
                      style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                    />
                  </div>
                  {campaign.progress >= 100 && (
                    <p className={`mt-2 text-sm font-medium ${
                      campaign.currentTickets >= campaign.ticketCap
                        ? "text-red-500"
                        : "text-green-500"
                    }`}>
                      {campaign.currentTickets >= campaign.ticketCap
                        ? "SOLD OUT"
                        : "Show confirmed, tickets still available"}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
} 