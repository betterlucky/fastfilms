'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function Header() {
  const router = useRouter()

  return (
    <header className="bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Button 
            variant="ghost" 
            className="-m-1.5 p-1.5"
            onClick={() => router.push("/")}
          >
            <span className="text-xl font-bold text-indigo-600">FastFilms</span>
          </Button>
        </div>
        <div className="flex gap-x-12">
          <Button 
            variant="ghost" 
            className="text-sm font-semibold leading-6 text-gray-900"
            onClick={() => router.push("/campaigns")}
          >
            Campaigns
          </Button>
          <Button 
            variant="ghost" 
            className="text-sm font-semibold leading-6 text-gray-900"
            onClick={() => router.push("/about")}
          >
            About
          </Button>
        </div>
        <div className="flex flex-1 justify-end">
          <Button 
            variant="ghost" 
            className="text-sm font-semibold leading-6 text-gray-900"
            onClick={() => router.push("/login")}
          >
            Log in <span aria-hidden="true">&rarr;</span>
          </Button>
        </div>
      </nav>
    </header>
  )
} 