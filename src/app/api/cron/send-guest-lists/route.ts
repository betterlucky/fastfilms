import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { sendGuestListsForToday } from "@/lib/cron/send-guest-lists"

// This secret should match the one set in your Vercel project settings
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  try {
    const headersList = headers()
    const authHeader = headersList.get("authorization")

    // Verify the request is coming from either Vercel Cron or GitHub Actions
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    console.log("Starting guest list sending process...")
    await sendGuestListsForToday()
    console.log("Guest lists sent successfully")
    
    return new NextResponse("Guest lists sent successfully", { status: 200 })
  } catch (error) {
    console.error("Error in cron job:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 