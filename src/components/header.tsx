import Link from "next/link"

export function Header() {
  return (
    <header className="bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-xl font-bold text-indigo-600">FastFilms</span>
          </Link>
        </div>
        <div className="flex gap-x-12">
          <Link href="/campaigns" className="text-sm font-semibold leading-6 text-gray-900">
            Campaigns
          </Link>
          <Link href="/about" className="text-sm font-semibold leading-6 text-gray-900">
            About
          </Link>
        </div>
        <div className="flex flex-1 justify-end">
          <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900">
            Log in <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>
    </header>
  )
} 