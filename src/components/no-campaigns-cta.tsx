import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Film, Users, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { CalendarIcon, UsersIcon, FilmIcon } from "lucide-react";
import { PlusIcon } from "lucide-react";

export function NoCampaignsCTA() {
  const router = useRouter();

  return (
    <div className="text-center space-y-8 py-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">No Upcoming Screenings</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We don't have any upcoming community cinema events at the moment, but we'd love to hear your ideas!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Got a Film in Mind?</CardTitle>
            <CardDescription>Suggest a screening</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Have a film you'd love to see in your community? Let us know and we'll help make it happen.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = "/contact"}
            >
              Suggest a Film
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stay in the Loop</CardTitle>
            <CardDescription>Get notified about future events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Sign up to be notified when new community cinema events are announced in your area.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => window.location.href = "/notify-me"}
            >
              Get Notified
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="pt-8">
        <p className="text-gray-500">
          Or follow us on social media to stay updated with the latest news and events
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open('https://twitter.com/fastfilms', '_blank', 'noopener,noreferrer')}
          >
            <span className="sr-only">Twitter</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open('https://facebook.com/fastfilms', '_blank', 'noopener,noreferrer')}
          >
            <span className="sr-only">Facebook</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open('https://instagram.com/fastfilms', '_blank', 'noopener,noreferrer')}
          >
            <span className="sr-only">Instagram</span>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-x-3">
              <div className="flex items-center justify-center rounded-lg bg-white/10 p-2 ring-1 ring-white/20">
                <CalendarIcon className="size-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold leading-6 text-white">Schedule screenings</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Select from our curated list of films or suggest your own.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-x-3">
              <div className="flex items-center justify-center rounded-lg bg-white/10 p-2 ring-1 ring-white/20">
                <UsersIcon className="size-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold leading-6 text-white">Invite friends</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Share with your community and gather ticket pledges.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-x-3">
              <div className="flex items-center justify-center rounded-lg bg-white/10 p-2 ring-1 ring-white/20">
                <FilmIcon className="size-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold leading-6 text-white">Watch together</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Once enough tickets are pledged, the screening is confirmed.
            </p>
          </div>
        </div>
        <Button onClick={() => router.push("/campaigns/new")} className="mt-8">
          Start a Campaign
        </Button>
      </div>

      <div className="text-center">
        <FilmIcon className="mx-auto size-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No campaigns</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new campaign.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/admin/campaigns/new">
              <PlusIcon className="size-4 mr-2" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 