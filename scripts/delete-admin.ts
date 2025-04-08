import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('Successfully connected to database')

    const oldAdminEmail = 'admin@fastfilms.com'

    console.log(`Attempting to delete admin user with email: ${oldAdminEmail}`)

    const result = await prisma.user.delete({
      where: { email: oldAdminEmail },
    })

    console.log(`Admin user deleted successfully:`, result)
  } catch (error) {
    if (error.code === 'P2025') {
      console.log('Admin user not found, nothing to delete')
    } else {
      console.error('Error deleting admin user:', error)
      process.exit(1)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
