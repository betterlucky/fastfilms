import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewCampaignPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Create New Campaign</h1>
      <Card>
        <CardHeader>
          <CardTitle>Campaign Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="isTest">Test Mode</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTest"
                  name="isTest"
                  defaultChecked={false}
                />
                <Label htmlFor="isTest" className="text-sm text-muted-foreground">
                  Enable test mode (no payments required)
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 