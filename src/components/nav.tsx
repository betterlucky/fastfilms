"use client"

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Session status:", status);
      console.log("Session data:", session);
    }
  }, [session, status]);

  return (
    <nav className="bg-white shadow-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <div className="flex flex-shrink-0 items-center">
              <Button
                variant="ghost"
                className="text-xl font-bold text-indigo-600"
                onClick={() => router.push("/")}
              >
                FastFilms
              </Button>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Button
                variant="ghost"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                onClick={() => router.push("/campaigns")}
              >
                Campaigns
              </Button>
              {status === "authenticated" && isAdmin && (
                <>
                  <Button
                    variant="ghost"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => router.push("/campaigns/new")}
                  >
                    Create Campaign
                  </Button>
                  <Button
                    variant="ghost"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => router.push("/venues/new")}
                  >
                    Create Venue
                  </Button>
                  <Button
                    variant="ghost"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => router.push("/venues")}
                  >
                    Manage Venues
                  </Button>
                  <Button
                    variant="ghost"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => router.push("/admin/charities")}
                  >
                    Manage Charities
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                onClick={() => router.push("/about")}
              >
                About
              </Button>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            ) : status === "authenticated" ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {session?.user?.email}
                </span>
                <Button
                  variant="ghost"
                  className="btn-secondary"
                  onClick={() => router.push("/api/auth/signout")}
                >
                  Log out
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="btn-primary"
                onClick={() => router.push("/login")}
              >
                Log in
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 