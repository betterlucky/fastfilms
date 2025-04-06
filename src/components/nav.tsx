"use client"

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                FastFilms
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/campaigns"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Campaigns
              </Link>
              {session?.user?.isAdmin && (
                <>
                  <Link
                    href="/campaigns/new"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    Create Campaign
                  </Link>
                  <Link
                    href="/venues/new"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    New Venue
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {session.user?.email}
                </span>
                <Link
                  href="/api/auth/signout"
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Log out
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 