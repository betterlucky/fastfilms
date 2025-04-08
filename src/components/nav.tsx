"use client"

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-20 md:hidden w-full bg-white shadow-sm">
        <div className="items-center justify-between flex px-4 h-16">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="font-bold text-xl text-indigo-600"
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
        <div className="transition-transform fixed inset-0 z-10 duration-300 ease-in-out md:hidden bg-white">
          <div className="flex flex-col pt-16 h-full">
            <div className="overflow-y-auto flex-1 space-y-1 p-4">
              <Button
                variant="ghost"
                onClick={() => {
                  router.push("/campaigns");
                  setIsOpen(false);
                }}
                className="items-center flex p-3 w-full hover:bg-gray-50 hover:text-gray-900 font-medium text-base text-gray-600 rounded-md"
              >
                Campaigns
              </Button>

              {status === "authenticated" && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push("/tickets");
                    setIsOpen(false);
                  }}
                  className="items-center flex p-3 w-full hover:bg-gray-50 hover:text-gray-900 font-medium text-base text-gray-600 rounded-md"
                >
                  My Tickets
                </Button>
              )}

              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push("/admin");
                    setIsOpen(false);
                  }}
                  className="items-center flex p-3 w-full hover:bg-gray-50 hover:text-gray-900 font-medium text-base text-gray-600 rounded-md"
                >
                  Admin Dashboard
                </Button>
              )}
            </div>

            <div className="shrink-0 p-4 border-t border-gray-200">
              {status === "authenticated" ? (
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full hover:bg-gray-50 hover:text-gray-900 text-gray-600"
                >
                  Log Out
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push("/login");
                    setIsOpen(false);
                  }}
                  className="w-full hover:bg-gray-50 hover:text-gray-900 text-gray-600"
                >
                  Log In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop navbar */}
      <nav className="fixed top-0 inset-x-0 z-10 hidden md:block h-16 bg-white shadow-sm">
        <div className="items-center justify-between flex px-4 h-full">
          <div className="items-center flex space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="font-bold text-xl text-indigo-600"
            >
              FastFilms
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                onClick={() => router.push("/campaigns")}
                className="hover:bg-gray-50 hover:text-gray-900 font-medium text-sm text-gray-600"
              >
                Campaigns
              </Button>
              {status === "authenticated" && (
                <Button
                  variant="ghost"
                  onClick={() => router.push("/tickets")}
                  className="hover:bg-gray-50 hover:text-gray-900 font-medium text-sm text-gray-600"
                >
                  My Tickets
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => router.push("/admin")}
                  className="hover:bg-gray-50 hover:text-gray-900 font-medium text-sm text-gray-600"
                >
                  Admin Dashboard
                </Button>
              )}
            </div>
          </div>
          {status === "authenticated" ? (
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="hover:bg-gray-50 hover:text-gray-900 text-gray-600"
            >
              Log Out
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="hover:bg-gray-50 hover:text-gray-900 text-gray-600"
            >
              Log In
            </Button>
          )}
        </div>
      </nav>
    </>
  );
} 