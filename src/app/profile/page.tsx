import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProfileTabs from './profile-tabs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      avatarColor: true,
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-gray-500">Manage your account settings and view your activity</p>
        </div>
        
        <ProfileTabs user={session.user} />
      </div>
    </div>
  )
} 