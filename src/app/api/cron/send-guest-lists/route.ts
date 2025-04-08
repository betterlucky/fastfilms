import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { sendGuestListsForToday } from '@/lib/cron/send-guest-lists'

// This secret should match the one set in your Vercel project settings
const CRON_SECRET = process.env.CRON_SECRET

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const headersList = headers()
    const authHeader = headersList.get('authorization')

    // Verify the request is coming from either Vercel Cron or GitHub Actions
    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log('Starting guest list sending process...')
    const result = await sendGuestListsForToday()

    if (result.guestListsSent === 0) {
      console.log('No screenings found for today, no guest lists needed')
      return new NextResponse('No guest lists needed to be sent today', {
        status: 204,
      })
    }

    console.log(`Successfully sent ${result.guestListsSent} guest list(s)`)
    return new NextResponse(
      JSON.stringify({
        message: `Successfully sent ${result.guestListsSent} guest list(s)`,
        guestListsSent: result.guestListsSent,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in cron job:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
