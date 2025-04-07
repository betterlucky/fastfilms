import { hash } from 'bcryptjs'
import { prisma, main } from './prisma-setup'

async function createAdmin() {
  const client = await main()
  
  try {
    const hashedPassword = await hash(process.env.ADMIN_PASSWORD || 'admin123', 12)
    
    const admin = await client.user.upsert({
      where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
      update: {
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('Admin user created/updated:', admin)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await client.$disconnect()
  }
}

createAdmin() 