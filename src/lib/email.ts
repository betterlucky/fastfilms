import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not found. Skipping email send.")
    return
  }

  try {
    await resend.emails.send({
      from: "FastFilms <noreply@fastfilms.example.com>",
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Failed to send email:", error)
  }
}

export function generateTicketConfirmationEmail(data: {
  movieTitle: string
  venueName: string
  screeningDate: Date
  ticketQuantity: number
  totalAmount: number
}) {
  const { movieTitle, venueName, screeningDate, ticketQuantity, totalAmount } = data

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Ticket Confirmation</title>
      </head>
      <body style="font-family: sans-serif; line-height: 1.5; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4f46e5; margin-bottom: 24px;">Your Tickets are Confirmed!</h1>
          
          <p>Thank you for your purchase. Your tickets for the following screening have been confirmed:</p>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h2 style="margin: 0 0 16px 0; color: #111827;">${movieTitle}</h2>
            <p style="margin: 8px 0;"><strong>Venue:</strong> ${venueName}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${screeningDate.toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${screeningDate.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p style="margin: 8px 0;"><strong>Tickets:</strong> ${ticketQuantity}</p>
            <p style="margin: 8px 0;"><strong>Total Paid:</strong> £${totalAmount.toFixed(2)}</p>
          </div>
          
          <p>Please arrive at least 15 minutes before the screening time. You'll need to show this email as proof of purchase.</p>
          
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions about your booking, please contact us at support@fastfilms.example.com
            </p>
          </div>
        </div>
      </body>
    </html>
  `
} 