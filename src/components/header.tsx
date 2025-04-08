'use client'

import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()

  return (
    <header className="relative z-10 bg-white shadow-soft">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="items-center justify-between flex h-16">
          <div className="items-center flex">
            <div className="shrink-0 items-center flex">
              <Button 
                variant="ghost" 
                onClick={() => router.push("/")}
                className="font-bold text-xl text-indigo-600"
              >
                FastFilms
              </Button>
            </div>

            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Button 
                variant="ghost" 
                onClick={() => router.push("/campaigns")}
                className="inline-flex items-center px-1 pt-1 hover:text-gray-900 font-medium text-sm text-gray-600"
              >
                Campaigns
              </Button>

              {session && (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push("/tickets")}
                    className="inline-flex items-center px-1 pt-1 hover:text-gray-900 font-medium text-sm text-gray-600"
                  >
                    My Tickets
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => router.push("/campaigns/new")}
                    className="inline-flex items-center px-1 pt-1 hover:text-gray-900 font-medium text-sm text-gray-600"
                  >
                    Create Campaign
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => router.push("/admin/venues")}
                    className="inline-flex items-center px-1 pt-1 hover:text-gray-900 font-medium text-sm text-gray-600"
                  >
                    Venues
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => router.push("/admin/charities")}
                    className="inline-flex items-center px-1 pt-1 hover:text-gray-900 font-medium text-sm text-gray-600"
                  >
                    Charities
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => router.push("/admin/users")}
                    className="inline-flex items-center px-1 pt-1 hover:text-gray-900 font-medium text-sm text-gray-600"
                  >
                    Users
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === "loading" ? (
              <div className="animate-pulse size-8 bg-gray-200 rounded-full" />
            ) : session ? (
              <div className="items-center flex space-x-4">
                <span className="text-sm text-gray-600">
                  {session.user?.email}
                </span>
                <Button 
                  variant="outline"
                  onClick={() => router.push("/auth/signout")}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline"
                onClick={() => router.push("/auth/signin")}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 