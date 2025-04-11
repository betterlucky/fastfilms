import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

interface AvatarWithFallbackProps {
  src?: string | null
  name?: string | null
  email?: string | null
  avatarColor?: string | null
  className?: string
}

export function AvatarWithFallback({
  src,
  name,
  email,
  avatarColor,
  className,
}: AvatarWithFallbackProps) {
  // Get initials from name or email
  const getInitials = () => {
    if (name) {
      const parts = name.split(' ')
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`
      }
      return name[0]
    }
    if (email) {
      return email[0]
    }
    return 'A'
  }

  // Generate consistent color based on name/email if no color is set
  const getColor = () => {
    if (avatarColor) return avatarColor
    const str = name || email || 'A'
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return COLORS[Math.abs(hash) % COLORS.length]
  }

  const initials = getInitials()
  const color = getColor()

  return (
    <Avatar className={cn('h-24 w-24', className)}>
      {src && <AvatarImage src={src} alt={name || 'User avatar'} />}
      <AvatarFallback className={cn(color, 'text-white font-semibold text-3xl')}>
        {initials.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
} 