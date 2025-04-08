import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyAdmin() {
  try {
    // Update all admin users to be email verified
    const result = await prisma.user.updateMany({
      where: {
        role: 'ADMIN',
      },
      data: {
        emailVerified: new Date(),
      },
    })

    console.log(`Updated ${result.count} admin users to be email verified`)
  } catch (error) {
    console.error('Error verifying admin users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdmin() 