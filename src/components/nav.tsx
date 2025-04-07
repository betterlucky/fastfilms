"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Nav() {
  const router = useRouter();

  return (
    <nav className="fixed inset-y-0 left-0 z-10 w-64 bg-white shadow-soft">
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center px-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-xl font-bold text-indigo-600"
          >
            FastFilms
          </Button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-1 px-2 py-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/campaigns")}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Campaigns
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/tickets")}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              My Tickets
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/campaigns/new")}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Create Campaign
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/admin/venues")}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Venues
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/admin/charities")}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Charities
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/admin/users")}
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Users
            </Button>
          </div>

          <div className="shrink-0 border-t border-gray-200 p-4">
            <Button
              variant="outline"
              onClick={() => router.push("/auth/signout")}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 