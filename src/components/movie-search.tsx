"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { TMDBFilm } from "@/lib/tmdb"

interface FilmSearchProps {
  onSelect: (film: TMDBFilm) => void
}

export default function FilmSearch({ onSelect }: FilmSearchProps) {
  const [query, setQuery] = useState("")
  const [films, setFilms] = useState<TMDBFilm[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const searchFilms = async () => {
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
        setError("Failed to search films. Please try again.")
        setFilms([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchFilms, 500)
    return () => clearTimeout(debounceTimer)
  }, [query])

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a film..."
          className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {films.length > 0 && (
        <div className="space-y-2">
          {films.map((film) => (
            <button
              key={film.id}
              onClick={() => onSelect(film)}
              className="flex w-full items-center space-x-3 rounded-lg border p-3 text-left hover:bg-gray-50"
            >
              {film.poster_path && (
                <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded">
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${film.poster_path}`}
                    alt={film.title}
                    width={92}
                    height={138}
                    className="rounded-md"
                    sizes="(max-width: 768px) 92px, 92px"
                  />
                </div>
              )}
              <div>
                <div className="font-medium">{film.title}</div>
                <div className="text-sm text-gray-500">
                  {new Date(film.release_date).toLocaleDateString("en-GB", {
                    year: "numeric",
                  })}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 