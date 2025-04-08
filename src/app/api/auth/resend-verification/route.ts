import { prisma } from '@/lib/db'
import { NextResponse, type NextRequest } from 'next/server'
import { sendEmail } from '@/lib/email'
import { generateVerificationEmail } from '@/lib/email'
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Generate new verification token
    const token = uuidv4()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    try {
      // Send verification email
      const baseUrl = request.nextUrl.origin
      const emailHtml = generateVerificationEmail(token, baseUrl)
      await sendEmail({
        to: email,
        subject: 'Verify your FastFilms account',
        html: emailHtml,
      })
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Delete the token since email failed
      await prisma.verificationToken.delete({
        where: { token },
      })
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Verification email sent. Please check your inbox.',
    })
  } catch (error) {
    console.error('Error resending verification email:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
