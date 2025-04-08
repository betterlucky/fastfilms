'use client'

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

interface CampaignEditFormProps {
  campaign: Campaign & {
    venue: Venue & {
      screens: Screen[]
      menuItems: MenuItem[]
    }
    menuItems: {
      menuItem: MenuItem
    }[]
    charity: Charity | null
  }
  venues: (Venue & {
    screens: Screen[]
    menuItems: MenuItem[]
  })[]
  charities: Charity[]
}

export function CampaignEditForm({ campaign, venues, charities }: CampaignEditFormProps) {
  const router = useRouter()
  const [selectedVenue, setSelectedVenue] = useState(campaign.venue.id)
  const [selectedScreen, setSelectedScreen] = useState(campaign.screenId)
  const [screeningDate, setScreeningDate] = useState(new Date(campaign.screeningDate))
  const [deadlineDate, setDeadlineDate] = useState(new Date(campaign.deadlineDate))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentVenue = venues.find(v => v.id === selectedVenue)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    
    try {
      const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: 'PUT',
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
          isFeatured: formData.get('isFeatured') === 'on'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to update campaign')
      }

      router.refresh()
      router.push('/admin/campaigns')
    } catch (error) {
      console.error('Error updating campaign:', error)
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium text-sm">Campaign Title</label>
          <Input
            id="title"
            name="title"
            defaultValue={campaign.title}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block font-medium text-sm">Description</label>
          <Textarea
            id="description"
            name="description"
            defaultValue={campaign.description}
            required
          />
        </div>

        <div>
          <label htmlFor="movieTitle" className="block font-medium text-sm">Movie Title</label>
          <Input
            id="movieTitle"
            name="movieTitle"
            defaultValue={campaign.movieTitle}
            required
          />
        </div>

        <div>
          <label htmlFor="customBlurb" className="block font-medium text-sm">Custom Blurb</label>
          <Textarea
            id="customBlurb"
            name="customBlurb"
            defaultValue={campaign.customBlurb || ''}
          />
        </div>

        <div>
          <label htmlFor="venue" className="block font-medium text-sm">Venue</label>
          <Select name="venueId" defaultValue={selectedVenue} onValueChange={setSelectedVenue}>
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
            defaultValue={selectedScreen || 'unassign'}
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
                defaultValue={campaign.screeningTime}
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
            defaultValue={campaign.ticketCap}
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
            defaultValue={Number(campaign.fundingTarget)}
            min={0}
            step={0.01}
            required
          />
        </div>

        <div>
          <label htmlFor="charity" className="block font-medium text-sm">Charity</label>
          <Select name="charityId" defaultValue={campaign.charityId || 'none'}>
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
              {Object.entries(
                currentVenue?.menuItems.reduce((acc, item) => {
                  if (!acc[item.category]) {
                    acc[item.category] = [];
                  }
                  acc[item.category].push(item);
                  return acc;
                }, {} as Record<string, MenuItem[]>) || {}
              ).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-medium">{category}</h3>
                  <div className="grid gap-2">
                    {items.map((item) => (
                      <div key={item.id} className="items-center flex gap-2">
                        <Checkbox
                          id={`menuItem-${item.id}`}
                          name="menuItemIds[]"
                          value={item.id}
                          defaultChecked={campaign.menuItems.some(mi => mi.menuItem.id === item.id)}
                        />
                        <label
                          htmlFor={`menuItem-${item.id}`}
                          className="flex-1 text-sm"
                        >
                          {item.name} - £{Number(item.price).toFixed(2)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="items-center flex gap-2">
          <Checkbox
            id="isFeatured"
            name="isFeatured"
            defaultChecked={campaign.isFeatured}
          />
          <label
            htmlFor="isFeatured"
            className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-medium text-sm leading-none"
          >
            Feature this campaign
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
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
} 