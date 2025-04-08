'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { TMDBFilm } from '@/lib/tmdb'

interface FilmSearchProps {
  onSelect: (film: TMDBFilm) => void
  value?: string
  onChange?: (value: string) => void
}

export default function FilmSearch({
  onSelect,
  value,
  onChange,
}: FilmSearchProps) {
  const [query, setQuery] = useState(value || '')
  const [films, setFilms] = useState<TMDBFilm[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const searchFilms = async () => {
      if (!query.trim()) {
        setFilms([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/films/search?query=${encodeURIComponent(query)}`
        )
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Search failed:', errorData)
          throw new Error(errorData.error || 'Failed to search films')
        }
        const data = await response.json()
        setFilms(data)
      } catch (err) {
        console.error('Search error:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to search films. Please try again.'
        )
        setFilms([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchFilms, 500)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange?.(newValue)
    setShowResults(true)
  }

  const handleFilmSelect = (film: TMDBFilm) => {
    setQuery(film.title)
    onChange?.(film.title)
    setShowResults(false)
    onSelect(film)
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          placeholder="Search for a film..."
          className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="size-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        )}
      </div>

      {error && <div className="mt-1 text-sm text-red-600">{error}</div>}

      {showResults && films.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
          <div className="max-h-60 overflow-auto py-1">
            {films.map((film) => (
              <button
                key={film.id}
                onClick={() => handleFilmSelect(film)}
                className="flex w-full items-center space-x-3 p-3 text-left hover:bg-gray-50"
              >
                {film.poster_path && (
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded">
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
                    {new Date(film.release_date).toLocaleDateString('en-GB', {
                      year: 'numeric',
                    })}
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
