import { Button } from "@/components/ui/button"

export default function DeleteCharityPage() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h1 className="text-3xl font-bold">Delete Charity</h1>
      <Button 
        variant="outline"
        onClick={() => window.location.href = "/admin/charities"}
      >
        Back to Charities
      </Button>
    </div>
  )
} 