"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Campaign, Venue, Charity, MenuItem, Screen } from "@prisma/client"
import FilmSearch from "@/components/movie-search"
import { TMDBFilm } from "@/lib/tmdb"

// Create a type for the serialized menu item where price is a number
type SerializedMenuItem = Omit<MenuItem, 'price'> & { price: number }
type SerializedVenue = Omit<Venue, 'menuItems'> & {
  screens: Screen[]
  menuItems: SerializedMenuItem[]
}

interface CampaignFormProps {
  venues: SerializedVenue[]
  charities: Charity[]
}

export function CampaignForm({ venues, charities }: CampaignFormProps) {
  const router = useRouter()
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedScreen, setSelectedScreen] = useState("")
  const [screeningDate, setScreeningDate] = useState(new Date())
  const [deadlineDate, setDeadlineDate] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFilm, setSelectedFilm] = useState<TMDBFilm | null>(null)
  const [title, setTitle] = useState("")
  const [movieTitle, setMovieTitle] = useState("")
  const [description, setDescription] = useState("")

  const currentVenue = venues.find(v => v.id === selectedVenue)

  const handleFilmSelect = (film: TMDBFilm) => {
    setSelectedFilm(film)
    setMovieTitle(film.title)
    if (!title) {
      setTitle(film.title)
    }
    if (!description) {
      setDescription(film.overview || "")
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    
    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title: title,
          description: description,
          movieTitle: movieTitle,
          customBlurb: formData.get('customBlurb'),
          venueId: formData.get('venueId'),
          screenId: formData.get('screenId') === 'unassign' ? null : formData.get('screenId'),
          screeningDate: screeningDate,
          screeningTime: formData.get('screeningTime'),
          deadlineDate: deadlineDate,
          ticketCap: Number(formData.get('ticketCap')),
          fundingTarget: Number(formData.get('fundingTarget')),
          charityId: formData.get('charityId') === 'none' ? null : formData.get('charityId'),
          menuItemIds: formData.getAll('menuItemIds[]'),
          isFeatured: formData.get('isFeatured') === 'on',
          isTest: formData.get('isTest') === 'on',
          tmdbId: selectedFilm?.id?.toString() || null,
          posterPath: selectedFilm?.poster_path || null,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      router.refresh()
      router.push('/admin/campaigns')
    } catch (error) {
      console.error('Error creating campaign:', error)
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="movieTitle" className="block font-medium text-sm">Film Title</label>
          <FilmSearch 
            onSelect={handleFilmSelect}
            value={movieTitle}
            onChange={setMovieTitle}
          />
        </div>

        <div>
          <label htmlFor="title" className="block font-medium text-sm">Campaign Title</label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block font-medium text-sm">Description</label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="customBlurb" className="block font-medium text-sm">Custom Blurb</label>
          <Textarea
            id="customBlurb"
            name="customBlurb"
          />
        </div>

        <div>
          <label htmlFor="venue" className="block font-medium text-sm">Venue</label>
          <Select name="venueId" value={selectedVenue} onValueChange={setSelectedVenue}>
            <SelectTrigger>
              <SelectValue placeholder="Select a venue" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="screen" className="block font-medium text-sm">Screen</label>
          <Select 
            name="screenId" 
            value={selectedScreen}
            onValueChange={setSelectedScreen}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a screen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassign">Unassign Screen</SelectItem>
              {currentVenue?.screens.map((screen) => (
                <SelectItem key={screen.id} value={screen.id}>
                  {screen.name} ({screen.capacity} seats)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="screeningDate" className="block font-medium text-sm">Screening Date & Time</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <DatePicker
                selected={screeningDate}
                onChange={(date: Date) => setScreeningDate(date)}
                dateFormat="dd/MM/yyyy"
                className="ring-1 ring-inset ring-gray-300 px-3.5 py-2 placeholder:text-gray-400 w-full text-gray-900 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholderText="Select date (DD/MM/YYYY)"
                required
              />
            </div>
            <div className="flex-1">
              <Input
                type="time"
                name="screeningTime"
                defaultValue="19:00"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="deadlineDate" className="block font-medium text-sm">Campaign Deadline</label>
          <DatePicker
            selected={deadlineDate}
            onChange={(date: Date) => setDeadlineDate(date)}
            dateFormat="dd/MM/yyyy"
            className="ring-1 ring-inset ring-gray-300 px-3.5 py-2 placeholder:text-gray-400 w-full text-gray-900 border-0 rounded-md shadow-sm focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholderText="Select date (DD/MM/YYYY)"
            required
          />
        </div>

        <div>
          <label htmlFor="ticketCap" className="block font-medium text-sm">Ticket Cap</label>
          <Input
            type="number"
            id="ticketCap"
            name="ticketCap"
            defaultValue={100}
            min={0}
            required
          />
        </div>

        <div>
          <label htmlFor="fundingTarget" className="block font-medium text-sm">Funding Target (£)</label>
          <Input
            type="number"
            id="fundingTarget"
            name="fundingTarget"
            defaultValue={300}
            min={0}
            step={0.01}
            required
          />
        </div>

        <div>
          <label htmlFor="charity" className="block font-medium text-sm">Charity</label>
          <Select name="charityId" defaultValue="none">
            <SelectTrigger>
              <SelectValue placeholder="Select a charity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No charity</SelectItem>
              {charities.map((charity) => (
                <SelectItem key={charity.id} value={charity.id}>
                  {charity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block mb-2 font-medium text-sm">Menu Items</label>
          {currentVenue?.menuItems.length === 0 ? (
            <p className="text-sm text-gray-500">No menu items available for this venue.</p>
          ) : (
            <div className="space-y-4">
              {currentVenue?.menuItems.map((menuItem) => (
                <div key={menuItem.id} className="items-center flex space-x-2">
                  <Checkbox
                    id={`menuItem-${menuItem.id}`}
                    name="menuItemIds[]"
                    value={menuItem.id}
                  />
                  <label
                    htmlFor={`menuItem-${menuItem.id}`}
                    className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-medium text-sm leading-none"
                  >
                    {menuItem.name} - £{Number(menuItem.price).toFixed(2)}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="items-center flex gap-2">
          <Checkbox
            id="isFeatured"
            name="isFeatured"
          />
          <label
            htmlFor="isFeatured"
            className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-medium text-sm leading-none"
          >
            Feature this campaign
          </label>
        </div>

        <div className="items-center flex gap-2">
          <Checkbox
            id="isTest"
            name="isTest"
          />
          <label
            htmlFor="isTest"
            className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-medium text-sm leading-none"
          >
            Test campaign
          </label>
        </div>
      </div>

      <div className="justify-end flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/campaigns')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  )
} 