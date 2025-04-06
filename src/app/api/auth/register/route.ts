import { prisma } from "@/lib/db"
import { NextResponse, type NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { sendEmail } from "@/lib/email"
import { generateVerificationEmail } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // Generate verification token
    const token = uuidv4()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    try {
      // Send verification email
      const emailHtml = generateVerificationEmail(token)
      await sendEmail({
        to: email,
        subject: "Verify your FastFilms account",
        html: emailHtml,
      })
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Delete the user and token since email failed
      await prisma.user.delete({
        where: { id: user.id },
      })
      await prisma.verificationToken.delete({
        where: { token },
      })
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again later." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      message: "Verification email sent. Please check your inbox.",
    })
  } catch (error) {
    console.error("Error in registration:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
} 