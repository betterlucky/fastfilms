'use client'

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { handleCustomBlurbUpdate, handleTicketCapUpdate, updateScreeningDateTime, updateDeadlineDate, assignScreen, updateCharity, updateCampaignMenuItems } from "./actions"
import Image from "next/image"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

interface CampaignDetailsProps {
  campaign: {
    id: string
    title: string
    description: string
    movieTitle: string
    screeningDate: Date
    screeningTime: string
    ticketCap: number
    currentTickets: number
    fundingTarget: string
    currentFunding: string
    customBlurb: string | null
    posterPath: string | null
    deadlineDate: Date
    screenId: string | null
    screen: {
      id: string
      name: string
      capacity: number
    } | null
    venue: {
      id: string
      name: string
    }
    charityId: string | null
    menuItems: {
      id: string
      name: string
      description: string
      price: number
      category: string
    }[]
  }
  isAdmin: boolean
  availableScreens: {
    id: string
    name: string
    capacity: number
  }[]
  charities: {
    id: string
    name: string
  }[]
  venueMenuItems: {
    id: string
    name: string
    description: string
    price: number
    category: string
  }[]
}

export default function CampaignDetails({
  campaign,
  isAdmin,
  availableScreens,
  charities,
  venueMenuItems,
}: CampaignDetailsProps) {
  const formattedDate = new Date(campaign.screeningDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const formattedDeadlineDate = new Date(campaign.deadlineDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h1 className="text-2xl font-bold">{campaign.title}</h1>
                    <p className="text-gray-500">{campaign.description}</p>
                    <div className="mt-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <Button 
                          size="lg" 
                          className="w-full md:w-auto"
                          onClick={() => window.location.href = `/campaigns/${campaign.id}/book`}
                        >
                          Book Tickets
                        </Button>
                      </div>
                      {campaign.charityId && (
                        <div className="mt-4 flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">
                            Proudly supporting {charities.find(c => c.id === campaign.charityId)?.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {campaign.posterPath && (
                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${campaign.posterPath}`}
                        alt={campaign.movieTitle}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {campaign.customBlurb && (
                  <div>
                    <h2 className="text-lg font-semibold">Additional Information</h2>
                    <p>{campaign.customBlurb}</p>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-semibold">Campaign Details</h2>
                  <dl className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <dt className="text-gray-500">Target Funding</dt>
                      <dd>£{campaign.fundingTarget}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Current Funding</dt>
                      <dd>£{campaign.currentFunding}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Tickets Sold</dt>
                      <dd>{campaign.currentTickets}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Screening Date</dt>
                      <dd>{formattedDate} at {campaign.screeningTime}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Campaign Deadline</dt>
                      <dd>{formattedDeadlineDate}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Venue</dt>
                      <dd>{campaign.venue.name}</dd>
                    </div>
                    {campaign.screen && (
                      <div>
                        <dt className="text-gray-500">Screen</dt>
                        <dd>{campaign.screen.name} ({campaign.screen.capacity} seats)</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold">Custom Blurb</h2>
                      <form action={handleCustomBlurbUpdate}>
                        <input type="hidden" name="campaignId" value={campaign.id} />
                        <div className="flex flex-col gap-2">
                          <Textarea
                            name="customBlurb"
                            defaultValue={campaign.customBlurb || ""}
                            placeholder="Enter a custom blurb for this campaign..."
                            className="min-h-[100px]"
                          />
                          <Button type="submit">Update Custom Blurb</Button>
                        </div>
                      </form>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold">Ticket Cap</h2>
                      <form action={handleTicketCapUpdate}>
                        <input type="hidden" name="campaignId" value={campaign.id} />
                        <div className="flex flex-col gap-2">
                          <Input
                            type="number"
                            name="ticketCap"
                            defaultValue={campaign.ticketCap}
                            min={0}
                          />
                          <Button type="submit">Update Ticket Cap</Button>
                        </div>
                      </form>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold">Screening Date & Time</h2>
                      <form action={updateScreeningDateTime}>
                        <input type="hidden" name="campaignId" value={campaign.id} />
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <DatePicker
                              selected={new Date(campaign.screeningDate)}
                              onChange={(date: Date) => {
                                const input = document.querySelector('input[name="screeningDate"]') as HTMLInputElement;
                                if (input && date) {
                                  input.value = date.toISOString().split('T')[0];
                                }
                              }}
                              dateFormat="dd/MM/yyyy"
                              className="flex-1 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholderText="Select date (DD/MM/YYYY)"
                              required
                            />
                            <Input
                              type="time"
                              name="screeningTime"
                              defaultValue={campaign.screeningTime}
                              className="flex-1"
                            />
                          </div>
                          <Button type="submit">Update Screening Time</Button>
                        </div>
                      </form>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold">Campaign Deadline</h2>
                      <form action={updateDeadlineDate}>
                        <input type="hidden" name="campaignId" value={campaign.id} />
                        <div className="flex flex-col gap-2">
                          <DatePicker
                            selected={new Date(campaign.deadlineDate)}
                            onChange={(date: Date) => {
                              const input = document.querySelector('input[name="deadlineDate"]') as HTMLInputElement;
                              if (input && date) {
                                input.value = date.toISOString().split('T')[0];
                              }
                            }}
                            dateFormat="dd/MM/yyyy"
                            className="flex-1 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholderText="Select date (DD/MM/YYYY)"
                            required
                          />
                          <Button type="submit">Update Deadline</Button>
                        </div>
                      </form>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold">Screen Assignment</h2>
                      <form action={assignScreen}>
                        <input type="hidden" name="campaignId" value={campaign.id} />
                        <div className="flex flex-col gap-2">
                          <Select name="screenId" defaultValue={campaign.screenId || "unassign"}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a screen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassign">Unassign Screen</SelectItem>
                              {availableScreens.map((screen) => (
                                <SelectItem key={screen.id} value={screen.id}>
                                  {screen.name} ({screen.capacity} seats)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button type="submit">
                            {campaign.screenId ? "Update Screen Assignment" : "Assign Screen"}
                          </Button>
                        </div>
                      </form>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold">Charity</h2>
                      <form action={updateCharity}>
                        <input type="hidden" name="campaignId" value={campaign.id} />
                        <div className="flex flex-col gap-2">
                          <Select name="charityId" defaultValue={campaign.charityId || "none"}>
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
                          <Button type="submit">Update Charity</Button>
                        </div>
                      </form>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold">Menu Items</h2>
                      <form action={updateCampaignMenuItems}>
                        <input type="hidden" name="campaignId" value={campaign.id} />
                        <div className="space-y-4">
                          {venueMenuItems.length === 0 ? (
                            <p className="text-sm text-gray-500">No menu items available for this venue.</p>
                          ) : (
                            <div className="grid gap-4">
                              {Object.entries(
                                venueMenuItems.reduce((acc, item) => {
                                  if (!acc[item.category]) {
                                    acc[item.category] = [];
                                  }
                                  acc[item.category].push(item);
                                  return acc;
                                }, {} as Record<string, typeof venueMenuItems>)
                              ).map(([category, items]) => (
                                <div key={category} className="space-y-2">
                                  <h3 className="font-medium">{category}</h3>
                                  <div className="grid gap-2">
                                    {items.map((item) => (
                                      <div key={item.id} className="flex items-center gap-2">
                                        <Checkbox
                                          id={`menuItem-${item.id}`}
                                          name="menuItemIds[]"
                                          value={item.id}
                                          defaultChecked={campaign.menuItems.some(mi => mi.id === item.id)}
                                        />
                                        <label
                                          htmlFor={`menuItem-${item.id}`}
                                          className="text-sm flex-1"
                                        >
                                          {item.name} - £{item.price.toFixed(2)}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <Button type="submit">
                            Update Menu Items
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              {/* Removed the Book Tickets button from here */}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 