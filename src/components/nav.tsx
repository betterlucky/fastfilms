"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Nav() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-20 w-full bg-white shadow-sm md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-xl font-bold text-indigo-600"
          >
            FastFilms
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-10 bg-white transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col pt-16">
          <div className="flex-1 space-y-1 overflow-y-auto p-4">
            <Button
              variant="ghost"
              onClick={() => {
                router.push("/campaigns");
                setIsOpen(false);
              }}
              className="flex w-full items-center rounded-md p-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Campaigns
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                router.push("/tickets");
                setIsOpen(false);
              }}
              className="flex w-full items-center rounded-md p-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              My Tickets
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                router.push("/campaigns/new");
                setIsOpen(false);
              }}
              className="flex w-full items-center rounded-md p-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Create Campaign
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                router.push("/admin/venues");
                setIsOpen(false);
              }}
              className="flex w-full items-center rounded-md p-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Venues
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                router.push("/admin/charities");
                setIsOpen(false);
              }}
              className="flex w-full items-center rounded-md p-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Charities
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                router.push("/admin/users");
                setIsOpen(false);
              }}
              className="flex w-full items-center rounded-md p-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Users
            </Button>
          </div>

          <div className="shrink-0 border-t border-gray-200 p-4">
            <Button
              variant="outline"
              onClick={() => {
                router.push("/auth/signout");
                setIsOpen(false);
              }}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <nav className="fixed inset-y-0 left-0 z-10 hidden w-64 bg-white shadow-soft md:block">
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
            <div className="flex-1 space-y-1 p-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/campaigns")}
                className="flex w-full items-center rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Campaigns
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/tickets")}
                className="flex w-full items-center rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                My Tickets
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/campaigns/new")}
                className="flex w-full items-center rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Create Campaign
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/admin/venues")}
                className="flex w-full items-center rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Venues
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/admin/charities")}
                className="flex w-full items-center rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Charities
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push("/admin/users")}
                className="flex w-full items-center rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
    </>
  );
} 