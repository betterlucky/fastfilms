'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Loader2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

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

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  movieTitle: z.string().min(1, 'Movie title is required'),
  description: z.string().min(1, 'Description is required'),
  fundingTarget: z.number().min(0, 'Funding target must be positive'),
  ticketCap: z.number().min(0, 'Ticket cap must be positive'),
  screeningDate: z.date(),
  deadlineDate: z.date(),
})

export function CampaignEditForm({
  campaign,
  venues,
  charities,
}: CampaignEditFormProps) {
  const router = useRouter()
  const [selectedVenue, setSelectedVenue] = useState(campaign.venue.id)
  const [selectedScreen, setSelectedScreen] = useState(campaign.screenId)
  const [screeningDate, setScreeningDate] = useState(
    new Date(campaign.screeningDate)
  )
  const [deadlineDate, setDeadlineDate] = useState(
    new Date(campaign.deadlineDate)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentVenue = venues.find((v) => v.id === selectedVenue)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: campaign.title,
      movieTitle: campaign.movieTitle,
      description: campaign.description,
      fundingTarget: Number(campaign.fundingTarget),
      ticketCap: campaign.ticketCap,
      screeningDate: new Date(campaign.screeningDate),
      deadlineDate: new Date(campaign.deadlineDate),
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      const formData = new FormData()

      // Add form values
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString().slice(0, 16))
        } else {
          formData.append(key, value.toString())
        }
      })

      // Add additional form data
      formData.append('customBlurb', '')
      formData.append('posterPath', '')
      formData.append('venueId', selectedVenue)
      formData.append('screenId', selectedScreen || 'unassign')
      formData.append('screeningTime', '')
      formData.append('charityId', campaign.charityId || 'none')
      formData.append(
        'menuItemIds',
        JSON.stringify(campaign.menuItems.map((item) => item.menuItem.id))
      )
      formData.append('isFeatured', 'on')

      const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update campaign')
      }

      toast.success('Campaign updated successfully')
      router.push('/admin/campaigns')
      router.refresh()
    } catch (error) {
      console.error('Error updating campaign:', error)
      toast.error('Failed to update campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter campaign title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="movieTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Movie Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter movie title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter campaign description"
                    className="h-32 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fundingTarget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funding Target (£)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter funding target"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ticketCap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket Cap</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter ticket cap"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="screeningDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Screening Date</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().slice(0, 16)
                        : ''
                    }
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deadlineDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deadline Date</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().slice(0, 16)
                        : ''
                    }
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
