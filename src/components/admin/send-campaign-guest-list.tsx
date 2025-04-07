'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Campaign {
  id: string
  name: string
  screeningDate: string
  venue: {
    name: string
    contactEmail: string | null
  }
}

export function SendCampaignGuestList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await fetch("/api/admin/campaigns/live")
        if (!response.ok) {
          throw new Error("Failed to fetch campaigns")
        }
        const data = await response.json()
        setCampaigns(data)
      } catch (error) {
        console.error("Error fetching campaigns:", error)
        toast.error("Failed to load campaigns")
      }
    }

    fetchCampaigns()
  }, [])

  const handleSendGuestList = async () => {
    if (!selectedCampaign) {
      toast.error("Please select a campaign")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/campaigns/${selectedCampaign}/send-guest-list`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to send guest list")
      }

      const campaign = campaigns.find(c => c.id === selectedCampaign)
      toast.success(`Guest list sent to ${campaign?.venue.name}`)
    } catch (error) {
      console.error("Error sending guest list:", error)
      toast.error("Failed to send guest list")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Campaign Guest List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select
            value={selectedCampaign}
            onValueChange={setSelectedCampaign}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name} - {new Date(campaign.screeningDate).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSendGuestList}
          disabled={isLoading || !selectedCampaign}
        >
          {isLoading ? "Sending..." : "Send Guest List & Preorders"}
        </Button>
      </CardContent>
    </Card>
  )
} 