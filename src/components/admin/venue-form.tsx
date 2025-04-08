"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { X } from "lucide-react"

const venueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postcode: z.string().min(1, "Postcode is required"),
  phone: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  contactEmail: z.array(z.string().email("Must be a valid email")).default([]),
})

type VenueFormValues = z.infer<typeof venueSchema>

interface VenueFormProps {
  initialData?: Partial<VenueFormValues>
  venueId?: string
}

export function VenueForm({ initialData, venueId }: VenueFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [newEmail, setNewEmail] = useState("")

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: initialData?.name || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      postcode: initialData?.postcode || "",
      phone: initialData?.phone || "",
      url: initialData?.url || "",
      contactEmail: initialData?.contactEmail || [],
    },
  })

  const onSubmit = async (data: VenueFormValues) => {
    try {
      setIsLoading(true)
      const url = venueId ? `/api/admin/venues/${venueId}` : "/api/admin/venues"
      const method = venueId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save venue")
      }

      toast.success(venueId ? "Venue updated successfully" : "Venue created successfully")
      router.push("/admin/venues")
      router.refresh()
    } catch (error) {
      console.error("Error saving venue:", error)
      toast.error("Failed to save venue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddEmail = () => {
    if (!newEmail) return

    const emails = form.getValues("contactEmail")
    if (!emails.includes(newEmail)) {
      form.setValue("contactEmail", [...emails, newEmail])
      setNewEmail("")
    }
  }

  const handleRemoveEmail = (emailToRemove: string) => {
    const emails = form.getValues("contactEmail")
    form.setValue(
      "contactEmail",
      emails.filter((email) => email !== emailToRemove)
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Venue name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Full address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postcode</FormLabel>
                <FormControl>
                  <Input placeholder="Postcode" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Emails</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Add email address"
                      />
                      <Button
                        type="button"
                        onClick={handleAddEmail}
                        disabled={!newEmail}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((email) => (
                        <div
                          key={email}
                          className="items-center flex px-2 py-1 gap-1 bg-gray-100 rounded"
                        >
                          <span className="text-sm">{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmail(email)}
                            className="hover:text-gray-700 text-gray-500"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="justify-end flex">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : venueId ? "Update Venue" : "Create Venue"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 