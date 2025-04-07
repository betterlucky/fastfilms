import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getCampaigns } from "@/lib/campaigns";

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
  screeningDate: Date;
  deadlineDate: Date;
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaigns</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
            <Card className="h-full transition-transform hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <CardTitle>{campaign.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{campaign.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <CalendarIcon className="size-4 mr-2" />
                  <span>
                    {new Date(campaign.screeningDate).toLocaleDateString()} -{" "}
                    {new Date(campaign.deadlineDate).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 