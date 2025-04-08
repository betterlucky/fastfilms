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
      <div className="items-center justify-between flex">
        <h1 className="font-bold text-3xl">Campaigns</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
            <Card className="transition-transform h-full hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <CardTitle>{campaign.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{campaign.description}</p>
                <div className="items-center flex mt-4 text-sm text-gray-500">
                  <CalendarIcon className="mr-2 size-4" />
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