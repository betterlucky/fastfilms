'use client'

import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()

  return (
    <header className="relative z-10 bg-white shadow-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex shrink-0 items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-xl font-bold text-indigo-600"
              >
                FastFilms
              </Button>
            </div>

            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Button
                variant="ghost"
                onClick={() => router.push('/campaigns')}
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Campaigns
              </Button>

              {session && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/tickets')}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    My Tickets
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => router.push('/campaigns/new')}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Create Campaign
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => router.push('/admin/venues')}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Venues
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => router.push('/admin/charities')}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Charities
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => router.push('/admin/users')}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Users
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === 'loading' ? (
              <div className="size-8 animate-pulse rounded-full bg-gray-200" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/profile')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Profile
                </Button>
                <span className="text-sm text-gray-600">
                  {session.user?.email}
                </span>
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/signout')}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => router.push('/auth/signin')}
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
