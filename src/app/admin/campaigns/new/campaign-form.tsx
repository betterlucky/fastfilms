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

interface CampaignFormProps {
  venues: (Venue & {
    screens: Screen[]
    menuItems: MenuItem[]
  })[]
  charities: Charity[]
}

export function CampaignForm({ venues, charities }: CampaignFormProps) {
  const router = useRouter()
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedScreen, setSelectedScreen] = useState("")
  const [screeningDate, setScreeningDate] = useState(new Date())
  const [deadlineDate, setDeadlineDate] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentVenue = venues.find(v => v.id === selectedVenue)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    
    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          movieTitle: formData.get('movieTitle'),
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
          isTest: formData.get('isTest') === 'on'
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
          <label htmlFor="title" className="block text-sm font-medium">Campaign Title</label>
          <Input
            id="title"
            name="title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <Textarea
            id="description"
            name="description"
            required
          />
        </div>

        <div>
          <label htmlFor="movieTitle" className="block text-sm font-medium">Movie Title</label>
          <Input
            id="movieTitle"
            name="movieTitle"
            required
          />
        </div>

        <div>
          <label htmlFor="customBlurb" className="block text-sm font-medium">Custom Blurb</label>
          <Textarea
            id="customBlurb"
            name="customBlurb"
          />
        </div>

        <div>
          <label htmlFor="venue" className="block text-sm font-medium">Venue</label>
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
          <label htmlFor="screen" className="block text-sm font-medium">Screen</label>
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
          <label htmlFor="screeningDate" className="block text-sm font-medium">Screening Date & Time</label>
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
          <label htmlFor="deadlineDate" className="block text-sm font-medium">Campaign Deadline</label>
          <DatePicker
            selected={deadlineDate}
            onChange={(date: Date) => setDeadlineDate(date)}
            dateFormat="dd/MM/yyyy"
            className="w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholderText="Select date (DD/MM/YYYY)"
            required
          />
        </div>

        <div>
          <label htmlFor="ticketCap" className="block text-sm font-medium">Ticket Cap</label>
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
          <label htmlFor="fundingTarget" className="block text-sm font-medium">Funding Target (£)</label>
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
          <label htmlFor="charity" className="block text-sm font-medium">Charity</label>
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
          <label className="block text-sm font-medium mb-2">Menu Items</label>
          {currentVenue?.menuItems.length === 0 ? (
            <p className="text-sm text-gray-500">No menu items available for this venue.</p>
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

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFeatured"
              name="isFeatured"
            />
            <label
              htmlFor="isFeatured"
              className="text-sm font-medium leading-none"
            >
              Feature this campaign
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isTest"
              name="isTest"
            />
            <label
              htmlFor="isTest"
              className="text-sm font-medium leading-none"
            >
              Enable test mode (no payments required)
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Campaign"}
        </Button>
      </div>
    </form>
  )
} 