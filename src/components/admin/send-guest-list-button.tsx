"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function SendGuestListButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSendGuestLists = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/cron/send-guest-lists", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to send guest lists")
      }

      toast.success("Guest lists sent successfully")
    } catch (error) {
      console.error("Error sending guest lists:", error)
      toast.error("Failed to send guest lists")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleSendGuestLists}
      disabled={isLoading}
    >
      {isLoading ? "Sending..." : "Send Today's Guest Lists"}
    </Button>
  )
} 