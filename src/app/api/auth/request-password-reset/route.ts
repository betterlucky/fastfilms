import { prisma } from '@/lib/db'
import { NextResponse, type NextRequest } from 'next/server'
import { sendEmail } from '@/lib/email'
import { generatePasswordResetEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Return success even if user doesn't exist (security through obscurity)
      return NextResponse.json({
        message:
          'If an account exists with this email, you will receive a password reset link.',
      })
    }

    // Delete any existing password reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    // Generate new password reset token
    const token = uuidv4()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Create new password reset token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    try {
      // Send password reset email
      const baseUrl = request.nextUrl.origin
      const emailHtml = generatePasswordResetEmail(token, baseUrl)
      await sendEmail({
        to: email,
        subject: 'Reset your FastFilms password',
        html: emailHtml,
      })
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Delete the token since email failed
      await prisma.passwordResetToken.delete({
        where: { token },
      })
      return NextResponse.json(
        {
          error: 'Failed to send password reset email. Please try again later.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message:
        'If an account exists with this email, you will receive a password reset link.',
    })
  } catch (error) {
    console.error('Error requesting password reset:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
