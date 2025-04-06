import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";

interface Campaign {
  id: string;
  title: string;
  movieTitle: string;
  description: string;
  posterPath: string | null;
  posterUrl: string | null;
  fundingTarget: string;
  currentFunding: string;
  currentTickets: number;
  ticketCap: number;
  screeningDate: Date;
  deadlineDate: Date;
  formattedTarget: string;
  formattedCurrent: string;
  formattedDate: string;
  progress: number;
  timeLeft: { days: number };
  venue: {
    name: string;
    id: string;
  };
  screen: {
    name: string;
    id: string;
    capacity: number;
  } | null;
  hasScreenAllocated: boolean;
}

interface CampaignHeroProps {
  campaign: Campaign;
}

export function CampaignHero({ campaign }: CampaignHeroProps) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Bring Cinema to Your Community
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Support and attend community film screenings across Cornwall. Book tickets, pre-order food and drinks, and help bring cinema to your local area.
        </p>
      </section>

      {/* Featured Campaign Section */}
      <section className="max-w-4xl mx-auto">
        <Link href={`/campaigns/${campaign.id}`} className="block group">
          <Card className="border-2 border-primary transition-transform hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl group-hover:text-gray-600">{campaign.movieTitle}</CardTitle>
              <CardDescription>{campaign.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.posterUrl ? (
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                  <Image
                    src={campaign.posterUrl}
                    alt={campaign.movieTitle}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No poster available</span>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-gray-600">{campaign.description}</p>
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Cinema: {campaign.venue.name}</p>
                    <p className="text-sm text-gray-500">{campaign.currentTickets} tickets sold</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Date: {campaign.formattedDate}</p>
                    <p className="text-sm text-gray-500">{campaign.timeLeft.days} days left</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Target: {campaign.formattedTarget}</p>
                    <p className="text-sm text-gray-500">Current: {campaign.formattedCurrent}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Progress: {campaign.progress}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          campaign.progress >= 100
                            ? campaign.currentTickets >= campaign.ticketCap
                              ? "bg-red-500"
                              : "bg-green-500"
                            : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                      />
                    </div>
                    {campaign.progress >= 100 && (
                      <p className={`text-sm ${campaign.currentTickets >= campaign.ticketCap ? "text-red-500" : "text-green-500"} font-medium`}>
                        {campaign.currentTickets >= campaign.ticketCap
                          ? "SOLD OUT"
                          : "Show confirmed, tickets still available"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Tickets from £5 + £0.50 fee
              </div>
              <div className="text-primary font-semibold group-hover:text-gray-600">
                Support This Campaign →
              </div>
            </CardFooter>
          </Card>
        </Link>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Community Powered</CardTitle>
            <CardDescription>Support local cinema initiatives</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Help bring cinema to your area by supporting crowdfunding campaigns. Every ticket counts!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Food & Drink</CardTitle>
            <CardDescription>Pre-order from local venues</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Enjoy delicious food and drinks from our partner venues. Pre-order with your tickets for a seamless experience.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flexible Pricing</CardTitle>
            <CardDescription>From £5 per ticket</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Affordable ticket pricing with a minimum of £5 plus a small transaction fee. Help make cinema accessible to all.</p>
          </CardContent>
        </Card>
      </section>

      {/* Secondary CTA */}
      <section className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Want to See More?</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Browse our upcoming campaigns and help bring cinema to your community.
        </p>
        <Button asChild variant="outline" size="lg">
          <Link href="/campaigns">View All Campaigns</Link>
        </Button>
      </section>
    </div>
  );
} 