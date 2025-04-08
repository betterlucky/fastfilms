import { getServerSession } from 'next-auth'
import { NextResponse, type NextRequest } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/email'
import { generateTicketConfirmationEmail } from '@/lib/email'
import { settings } from '@/config/settings'

interface MenuSelection {
  quantity: number
  options: Record<string, string[]>
}

interface RequestBody {
  campaignId: string
  quantity: number
  ticketPrice: number
  payItForwardTickets: number
  menuSelections: Record<string, MenuSelection>
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { campaignId, quantity = 1, ticketPrice, payItForwardTickets, menuSelections } = await request.json() as RequestBody

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        venue: true,
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      )
    }

    if (campaign.currentTickets + quantity > campaign.ticketCap) {
      return NextResponse.json(
        { error: 'Not enough tickets available' },
        { status: 400 }
      )
    }

    // Calculate total amount
    const transactionFee = 0.5
    const totalAmount = (ticketPrice * quantity) + (payItForwardTickets * 5) + transactionFee

    if (campaign.isTest) {
      // For test campaigns, create tickets directly without Stripe
      const regularTickets = await Promise.all(
        Array.from({ length: quantity }).map(() =>
          prisma.ticket.create({
            data: {
              campaignId,
              userId: session.user.id,
              pricePaid: ticketPrice,
              status: 'CONFIRMED',
            },
          })
        )
      )

      // Create pay-it-forward tickets if any
      const pifTickets = await Promise.all(
        Array.from({ length: payItForwardTickets }).map(() =>
          prisma.ticket.create({
            data: {
              campaignId,
              userId: session.user.id,
              pricePaid: settings.minimumTicketPrice,
              status: 'PAY_IT_FORWARD',
            },
          })
        )
      )

      // Create menu item orders if provided
      if (menuSelections) {
        for (const ticket of regularTickets) {
          for (const [menuItemId, selection] of Object.entries(menuSelections)) {
            if (selection.quantity > 0) {
              await prisma.order.create({
                data: {
                  ticketId: ticket.id,
                  menuItemId,
                  quantity: selection.quantity,
                },
              })
            }
          }
        }
      }

      // Send confirmation email
      const emailData = {
        movieTitle: campaign.movieTitle,
        venueName: campaign.venue.name,
        screeningDate: campaign.screeningDate,
        ticketQuantity: quantity + pifTickets.length,
        totalAmount: totalAmount,
      }

      const emailHtml = generateTicketConfirmationEmail(emailData)
      await sendEmail({
        to: session.user.email || '',
        subject: `Your tickets for ${campaign.movieTitle}`,
        html: emailHtml,
      })

      // Update campaign ticket count and funding
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          currentTickets: {
            increment: quantity + pifTickets.length,
          },
          currentFunding: {
            increment: (ticketPrice * quantity) + (settings.minimumTicketPrice * pifTickets.length),
          },
        },
      })

      return NextResponse.json({
        clientSecret: 'test_mode',
        ticketIds: [...regularTickets, ...pifTickets].map((ticket) => ticket.id),
      })
    } else {
      // For real campaigns, use Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: formatAmountForStripe(totalAmount, 'GBP'),
        currency: 'gbp',
        metadata: {
          campaignId,
          userId: session.user.id,
          quantity: quantity.toString(),
          payItForwardTickets: payItForwardTickets.toString(),
        },
      })

      // Create pending ticket(s)
      const regularTickets = await Promise.all(
        Array.from({ length: quantity }).map(() =>
          prisma.ticket.create({
            data: {
              campaignId,
              userId: session.user.id,
              pricePaid: ticketPrice,
              status: 'PENDING',
              stripePaymentIntentId: paymentIntent.id,
            },
          })
        )
      )

      // Create pending pay-it-forward tickets
      const pifTickets = await Promise.all(
        Array.from({ length: payItForwardTickets }).map(() =>
          prisma.ticket.create({
            data: {
              campaignId,
              userId: session.user.id,
              pricePaid: settings.minimumTicketPrice,
              status: 'PAY_IT_FORWARD',
              stripePaymentIntentId: paymentIntent.id,
            },
          })
        )
      )

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        ticketIds: [...regularTickets, ...pifTickets].map((ticket) => ticket.id),
      })
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
