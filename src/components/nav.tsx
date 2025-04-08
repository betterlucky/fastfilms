'use client'

import { Button } from '@/components/ui/button'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

export function Nav() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session, status } = useSession()

  const isAdmin = session?.user?.role === 'ADMIN'

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed left-0 top-0 z-20 w-full bg-white shadow-sm md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-xl font-bold text-indigo-600"
          >
            FastFilms
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
          >
            {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 z-10 bg-white transition-transform duration-300 ease-in-out md:hidden">
          <div className="flex h-full flex-col pt-16">
            <div className="flex-1 space-y-1 overflow-y-auto p-4">
              <Button
                variant="ghost"
                onClick={() => {
                  router.push('/campaigns')
                  setIsOpen(false)
                }}
                className="flex w-full items-center rounded-md p-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Campaigns
              </Button>

              {status === 'authenticated' && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push('/tickets')
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center rounded-md p-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  My Tickets
                </Button>
              )}

              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push('/admin')
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center rounded-md p-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Admin Dashboard
                </Button>
              )}
            </div>

            <div className="shrink-0 border-t border-gray-200 p-4">
              {status === 'authenticated' ? (
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Log Out
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push('/login')
                    setIsOpen(false)
                  }}
                  className="w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Log In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop navbar */}
      <nav className="fixed inset-x-0 top-0 z-10 hidden h-16 bg-white shadow-sm md:block">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-xl font-bold text-indigo-600"
            >
              FastFilms
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                onClick={() => router.push('/campaigns')}
                className="text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Campaigns
              </Button>
              {status === 'authenticated' && (
                <Button
                  variant="ghost"
                  onClick={() => router.push('/tickets')}
                  className="text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  My Tickets
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => router.push('/admin')}
                  className="text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Admin Dashboard
                </Button>
              )}
            </div>
          </div>
          {status === 'authenticated' ? (
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Log Out
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => router.push('/login')}
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Log In
            </Button>
          )}
        </div>
      </nav>
    </>
  )
}
