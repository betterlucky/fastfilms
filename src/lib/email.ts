import nodemailer from "nodemailer"

// Create a transporter using Gmail SMTP with secure settings
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.CONTACT_EMAIL,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.CONTACT_EMAIL || !process.env.EMAIL_HOST_PASSWORD) {
    console.warn("Email credentials not found. Skipping email send.")
    return
  }

  try {
    // Verify the connection configuration
    await transporter.verify()
    
    await transporter.sendMail({
      from: `FastFilms <${process.env.CONTACT_EMAIL}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Failed to send email:", error)
    throw error // Re-throw to handle in the calling code
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

export function generateVerificationEmail(token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: sans-serif; line-height: 1.5; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4f46e5; margin-bottom: 24px;">Verify Your Email</h1>
          
          <p>Thank you for registering with FastFilms! Please click the button below to verify your email address:</p>
          
          <div style="margin: 32px 0;">
            <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Verify Email Address
            </a>
          </div>
          
          <p>If you did not create an account with FastFilms, you can safely ignore this email.</p>
          
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This link will expire in 24 hours. If you need a new verification link, please contact us at support@fastfilms.example.com
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function generatePasswordResetEmail(token: string, baseUrl: string) {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: sans-serif; line-height: 1.5; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4f46e5; margin-bottom: 24px;">Reset Your Password</h1>
          
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Reset Password
            </a>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This link will expire in 1 hour. If you need a new password reset link, please request another one.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
} 