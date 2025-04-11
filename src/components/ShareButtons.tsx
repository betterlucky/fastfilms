'use client'

import { useState } from 'react'
import { FaTwitter, FaFacebook, FaWhatsapp, FaLinkedin } from 'react-icons/fa'
import { MdEmail, MdLink } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
}

export default function ShareButtons({ url, title, description = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)

  const shareLinks = {
    twitter: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Failed to copy link')
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(shareLinks.twitter, '_blank')}
        title="Share on Twitter"
      >
        <FaTwitter className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(shareLinks.facebook, '_blank')}
        title="Share on Facebook"
      >
        <FaFacebook className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(shareLinks.whatsapp, '_blank')}
        title="Share on WhatsApp"
      >
        <FaWhatsapp className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(shareLinks.linkedin, '_blank')}
        title="Share on LinkedIn"
      >
        <FaLinkedin className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(shareLinks.email, '_blank')}
        title="Share via Email"
      >
        <MdEmail className="size-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={copyToClipboard}
        title="Copy Link"
        className={copied ? 'bg-green-100 hover:bg-green-200' : ''}
      >
        <MdLink className="size-4" />
      </Button>
    </div>
  )
} 