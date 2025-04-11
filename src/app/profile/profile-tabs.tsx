'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { TicketIcon } from 'lucide-react'
import OrderHistory from '@/components/OrderHistory'
import UserComments from '@/components/UserComments'
import { AvatarWithFallback } from '@/components/ui/avatar-with-fallback'
import { cn } from '@/lib/utils'

// Color palette for avatars
const COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
]

interface User {
  id: string
  name?: string | null
  email?: string | null
  role?: string
  image?: string | null
  avatarColor?: string | null
}

interface ProfileTabsProps {
  user: User
}

export default function ProfileTabs({ user }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const { update } = useSession()
  const router = useRouter()

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const avatarColor = formData.get('avatarColor') as string

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatarColor }),
      })

      if (!response.ok) throw new Error('Failed to update profile')

      await update()
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <AvatarWithFallback
                src={user.image}
                name={user.name}
                email={user.email}
                avatarColor={user.avatarColor}
              />
              <div>
                <h2 className="text-xl font-semibold">{user.name || 'Anonymous'}</h2>
                <p className="text-gray-500">{user.email || 'No email provided'}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {user.role?.toLowerCase() || 'No role specified'}
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user.name || ''}
                  placeholder="Enter your display name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Avatar Color</Label>
                <div className="grid grid-cols-8 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        const form = document.querySelector('form')
                        if (form) {
                          const input = form.querySelector('input[name="avatarColor"]') as HTMLInputElement
                          if (input) {
                            input.value = color
                            form.requestSubmit()
                          }
                        }
                      }}
                      className={cn(
                        'size-8 rounded-full transition-transform hover:scale-110',
                        color,
                        user.avatarColor === color && 'ring-2 ring-offset-2 ring-gray-900'
                      )}
                    />
                  ))}
                </div>
                <input type="hidden" name="avatarColor" defaultValue={user.avatarColor || ''} />
              </div>

              <Button type="submit">Update Profile</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="orders">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Orders</h2>
              <Button
                variant="outline"
                onClick={() => router.push('/tickets')}
                className="flex items-center gap-2"
              >
                <TicketIcon className="size-4" />
                View All Tickets
              </Button>
            </div>
            <OrderHistory />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="comments">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Comments</h2>
            <UserComments />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email || 'No email provided'} disabled />
                <p className="text-sm text-gray-500">
                  Contact support to change your email address
                </p>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 