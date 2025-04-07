import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function main() {
  try {
    await prisma.$connect()
    return prisma
  } catch (error) {
    console.error('Error connecting to the database:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
} 