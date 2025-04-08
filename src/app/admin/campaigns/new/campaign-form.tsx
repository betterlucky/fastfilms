'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TimeInput } from '@/components/ui/time-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Campaign, Venue, Charity, MenuItem, Screen } from '@prisma/client'
import FilmSearch from '@/components/movie-search'
import { TMDBFilm } from '@/lib/tmdb'

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

type TimeUnit = 'days' | 'weeks'

export function CampaignForm({ venues, charities }: CampaignFormProps) {
  const router = useRouter()
  const [selectedVenue, setSelectedVenue] = useState('')
  const [selectedScreen, setSelectedScreen] = useState('')
  const [screeningDate, setScreeningDate] = useState(new Date())
  const [deadlineTimeAmount, setDeadlineTimeAmount] = useState(1)
  const [deadlineTimeUnit, setDeadlineTimeUnit] = useState<TimeUnit>('weeks')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFilm, setSelectedFilm] = useState<TMDBFilm | null>(null)
  const [title, setTitle] = useState('')
  const [movieTitle, setMovieTitle] = useState('')
  const [description, setDescription] = useState('')
  const [posterPath, setPosterPath] = useState('')

  const currentVenue = venues.find((v) => v.id === selectedVenue)

  const handleFilmSelect = (film: TMDBFilm) => {
    setSelectedFilm(film)
    setMovieTitle(film.title)
    if (!title) {
      setTitle(film.title)
    }
    if (!description) {
      setDescription(film.overview || '')
    }
    setPosterPath(film.poster_path || '')
  }

  const calculateDeadlineDate = (): Date => {
    const deadline = new Date(screeningDate)
    if (deadlineTimeUnit === 'weeks') {
      deadline.setDate(deadline.getDate() - deadlineTimeAmount * 7)
    } else {
      deadline.setDate(deadline.getDate() - deadlineTimeAmount)
    }
    return deadline
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
          screenId:
            formData.get('screenId') === 'unassign'
              ? null
              : formData.get('screenId'),
          screeningDate: screeningDate,
          screeningTime: formData.get('screeningTime'),
          deadlineDate: calculateDeadlineDate(),
          ticketCap: Number(formData.get('ticketCap')),
          fundingTarget: Number(formData.get('fundingTarget')),
          charityId:
            formData.get('charityId') === 'none'
              ? null
              : formData.get('charityId'),
          menuItemIds: formData.getAll('menuItemIds[]'),
          isFeatured: formData.get('isFeatured') === 'on',
          isTest: formData.get('isTest') === 'on',
          tmdbId: selectedFilm?.id?.toString() || null,
          posterPath: posterPath || null,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
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
          <label htmlFor="movieTitle" className="block text-sm font-medium">
            Film Title
          </label>
          <FilmSearch
            onSelect={handleFilmSelect}
            value={movieTitle}
            onChange={setMovieTitle}
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Campaign Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="customBlurb" className="block text-sm font-medium">
            Custom Blurb
          </label>
          <Textarea id="customBlurb" name="customBlurb" />
        </div>

        <div>
          <label htmlFor="posterPath" className="block text-sm font-medium">
            Poster Image URL
          </label>
          <div className="space-y-2">
            <Input
              id="posterPath"
              value={posterPath}
              onChange={(e) => setPosterPath(e.target.value)}
              placeholder="TMDB path (e.g. /1H1y9ZiqNFaLgQiRDDZLA55PviW.jpg) or full URL"
            />
            {posterPath && (
              <p className="text-muted-foreground text-sm">
                {posterPath.startsWith('http') ? (
                  <>
                    Using custom URL: <code>{posterPath}</code>
                  </>
                ) : (
                  <>
                    Using TMDB path:{' '}
                    <code>https://image.tmdb.org/t/p/w500{posterPath}</code>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="venue" className="block text-sm font-medium">
            Venue
          </label>
          <Select
            name="venueId"
            value={selectedVenue}
            onValueChange={setSelectedVenue}
          >
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
          <label htmlFor="screen" className="block text-sm font-medium">
            Screen
          </label>
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
          <label htmlFor="screeningDate" className="block text-sm font-medium">
            Screening Date & Time
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <DatePicker
                selected={screeningDate}
                onChange={(date: Date) => setScreeningDate(date)}
                dateFormat="dd/MM/yyyy"
                className="w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholderText="Select date (DD/MM/YYYY)"
                required
              />
            </div>
            <div className="flex-1">
              <TimeInput name="screeningTime" defaultValue="7:00" required />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="deadlineTime" className="block text-sm font-medium">
            Campaign Deadline
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="number"
                id="deadlineTimeAmount"
                value={deadlineTimeAmount}
                onChange={(e) => setDeadlineTimeAmount(Number(e.target.value))}
                min={1}
                required
              />
            </div>
            <div className="flex-1">
              <Select
                value={deadlineTimeUnit}
                onValueChange={(value: TimeUnit) => setDeadlineTimeUnit(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-2">
              <p className="text-muted-foreground text-sm">
                Deadline: {calculateDeadlineDate().toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Time before screening date when campaign will close
          </p>
        </div>

        <div>
          <label htmlFor="ticketCap" className="block text-sm font-medium">
            Ticket Cap
          </label>
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
          <label htmlFor="fundingTarget" className="block text-sm font-medium">
            Funding Target (£)
          </label>
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
          <label htmlFor="charity" className="block text-sm font-medium">
            Charity
          </label>
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
          <label className="mb-2 block text-sm font-medium">Menu Items</label>
          {currentVenue?.menuItems.length === 0 ? (
            <p className="text-sm text-gray-500">
              No menu items available for this venue.
            </p>
          ) : (
            <div className="space-y-4">
              {currentVenue?.menuItems.map((menuItem) => (
                <div key={menuItem.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`menuItem-${menuItem.id}`}
                    name="menuItemIds[]"
                    value={menuItem.id}
                  />
                  <label
                    htmlFor={`menuItem-${menuItem.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {menuItem.name} - £{Number(menuItem.price).toFixed(2)}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="isFeatured" name="isFeatured" />
          <label
            htmlFor="isFeatured"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Feature this campaign
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="isTest" name="isTest" />
          <label
            htmlFor="isTest"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Test campaign
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4">
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
