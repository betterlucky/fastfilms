"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FilmSearch from "@/components/movie-search"
import { TMDBFilm } from "@/lib/tmdb"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

type Venue = {
  id: string
  name: string
}

interface NewCampaignFormProps {
  venues: Venue[]
}

type CutoffUnit = 'days' | 'weeks'

export default function NewCampaignForm({ venues }: NewCampaignFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilm, setSelectedFilm] = useState<TMDBFilm | null>(null)
  const [screeningDate, setScreeningDate] = useState<Date | null>(null)
  const [screeningTime, setScreeningTime] = useState<string>("19:00")
  const [cutoffPeriod, setCutoffPeriod] = useState<number>(14)
  const [cutoffUnit, setCutoffUnit] = useState<CutoffUnit>('days')

  // Calculate deadline date based on screening date and cutoff period
  const calculateDeadlineDate = (screeningDate: Date | null): Date | null => {
    if (!screeningDate) return null
    const deadline = new Date(screeningDate)
    const daysToSubtract = cutoffUnit === 'weeks' ? cutoffPeriod * 7 : cutoffPeriod
    deadline.setDate(deadline.getDate() - daysToSubtract)
    return deadline
  }

  const deadlineDate = calculateDeadlineDate(screeningDate)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!screeningDate || !deadlineDate) {
      setError("Please select a screening date")
      setIsLoading(false)
      return
    }

    const formData = new FormData(event.currentTarget)
    const data = {
      title: selectedFilm?.title || "",
      movieTitle: selectedFilm?.title || "",
      description: formData.get("description") as string,
      fundingTarget: Number(formData.get("fundingTarget")),
      screeningDate,
      screeningTime,
      deadlineDate,
      currentFunding: 0,
      status: "ACTIVE",
      venueId: formData.get("venueId") as string,
      tmdbId: selectedFilm?.id?.toString() || null,
      posterPath: selectedFilm?.poster_path,
    }

    console.log("Submitting campaign data:", data)

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.error || "Failed to create campaign")
      }

      router.push("/campaigns")
      router.refresh()
    } catch (err) {
      console.error("Form submission error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-16 max-w-2xl sm:mt-20">
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="col-span-full">
          <label
            htmlFor="title"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Film Title
          </label>
          <div className="mt-2">
            <FilmSearch onSelect={setSelectedFilm} />
          </div>
        </div>

        <div className="col-span-full">
          <label
            htmlFor="description"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Description
          </label>
          <div className="mt-2">
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
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

        <div className="sm:col-span-2">
          <label
            htmlFor="screeningDate"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Screening Date
          </label>
          <div className="mt-2.5">
            <DatePicker
              selected={screeningDate}
              onChange={(date: Date) => setScreeningDate(date)}
              dateFormat={["dd/MM/yyyy", "d/M/yy", "d/M/yyyy"]}
              minDate={new Date()}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholderText="Select or type date (e.g. 5/6/25)"
              isClearable
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="screeningTime"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Screening Time
          </label>
          <div className="mt-2.5">
            <input
              type="time"
              name="screeningTime"
              id="screeningTime"
              value={screeningTime}
              onChange={(e) => setScreeningTime(e.target.value)}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="cutoffPeriod"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Campaign Cutoff Period
          </label>
          <div className="mt-2.5 flex gap-2">
            <input
              type="number"
              id="cutoffPeriod"
              value={cutoffPeriod}
              onChange={(e) => setCutoffPeriod(Number(e.target.value))}
              min="1"
              required
              className="block w-24 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <select
              value={cutoffUnit}
              onChange={(e) => setCutoffUnit(e.target.value as CutoffUnit)}
              className="block rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
          {deadlineDate && (
            <p className="mt-1 text-sm text-gray-500">
              Campaign deadline will be {deadlineDate.toLocaleDateString('en-GB')}
            </p>
          )}
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="venueId"
            className="block text-sm font-semibold leading-6 text-gray-900"
          >
            Venue
          </label>
          <div className="mt-2.5">
            <select
              id="venueId"
              name="venueId"
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
        <div className="rounded-md bg-red-50 p-4 mt-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Campaign"}
        </button>
      </div>
    </form>
  )
} 