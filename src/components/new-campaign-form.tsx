"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FilmSearch from "@/components/movie-search"
import { TMDBFilm } from "@/lib/tmdb"

type Venue = {
  id: string
  name: string
}

interface NewCampaignFormProps {
  venues: Venue[]
}

export default function NewCampaignForm({ venues }: NewCampaignFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilm, setSelectedFilm] = useState<TMDBFilm | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = {
      title: selectedFilm?.title || "",
      movieTitle: selectedFilm?.title || "",
      description: formData.get("description") as string,
      fundingTarget: Number(formData.get("fundingTarget")),
      screeningDate: new Date(formData.get("screeningDate") as string),
      deadlineDate: new Date(formData.get("deadlineDate") as string),
      currentFunding: 0,
      status: "ACTIVE",
      venueId: formData.get("venueId") as string,
      tmdbId: selectedFilm?.id,
      posterPath: selectedFilm?.poster_path,
    }

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create campaign")
      }

      router.push("/campaigns")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-16 max-w-xl">
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="movieTitle"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Film Title
          </label>
          <div className="mt-2.5">
            <FilmSearch onSelect={(film) => setSelectedFilm(film)} />
            {selectedFilm && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {selectedFilm.title} ({new Date(selectedFilm.release_date).getFullYear()})
              </div>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Description
          </label>
          <div className="mt-2.5">
            <textarea
              name="description"
              id="description"
              rows={4}
              required
              defaultValue={selectedFilm?.overview}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="fundingTarget"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Funding Target (£)
          </label>
          <div className="mt-2.5">
            <input
              type="number"
              name="fundingTarget"
              id="fundingTarget"
              required
              min="0"
              step="0.01"
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="deadlineDate"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Campaign Deadline
          </label>
          <div className="mt-2.5">
            <input
              type="date"
              name="deadlineDate"
              id="deadlineDate"
              required
              min={new Date().toISOString().split("T")[0]}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="screeningDate"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Screening Date
          </label>
          <div className="mt-2.5">
            <input
              type="date"
              name="screeningDate"
              id="screeningDate"
              required
              min={new Date().toISOString().split("T")[0]}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="venueId"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Venue
          </label>
          <div className="mt-2.5">
            <select
              name="venueId"
              id="venueId"
              required
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="">Select a venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-10">
        <button
          type="submit"
          disabled={isLoading || !selectedFilm}
          className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Campaign"}
        </button>
      </div>
    </form>
  )
} 