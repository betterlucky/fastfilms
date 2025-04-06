"use client"

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  return (
    <nav className="bg-white shadow-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary-600">FastFilms</span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/campaigns"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Campaigns
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/campaigns/new"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Create Campaign
                  </Link>
                  <Link
                    href="/venues/new"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Create Venue
                  </Link>
                  <Link
                    href="/venues"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Manage Venues
                  </Link>
                  <Link
                    href="/admin/charities"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Manage Charities
                  </Link>
                </>
              )}
              <Link
                href="/about"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                About
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {session.user?.email}
                </span>
                <Link
                  href="/api/auth/signout"
                  className="btn-secondary"
                >
                  Log out
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-primary"
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