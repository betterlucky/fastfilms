"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { TMDBMovie } from "@/lib/tmdb"

interface FilmSearchProps {
  onSelect: (film: TMDBMovie) => void
}

export default function FilmSearch({ onSelect }: FilmSearchProps) {
  const [query, setQuery] = useState("")
  const [films, setFilms] = useState<TMDBMovie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setFilms([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/films/search?query=${encodeURIComponent(query)}`)
        if (!response.ok) {
          throw new Error("Failed to search films")
        }
        const data = await response.json()
        setFilms(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setFilms([])
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(search, 500)
    return () => clearTimeout(timeoutId)
  }, [query])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a film..."
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {films.length > 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="max-h-96 overflow-y-auto py-1">
            {films.map((film) => (
              <button
                key={film.id}
                onClick={() => onSelect(film)}
                className="flex w-full items-center gap-4 px-4 py-2 text-left hover:bg-gray-50"
              >
                {film.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${film.poster_path}`}
                    alt={film.title}
                    width={46}
                    height={69}
                    className="rounded"
                  />
                ) : (
                  <div className="h-[69px] w-[46px] rounded bg-gray-200" />
                )}
                <div>
                  <div className="font-medium text-gray-900">{film.title}</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(film.release_date)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 