import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getFeaturedCampaign } from '@/lib/campaigns'
import { CampaignHero } from '@/components/campaign-hero'
import { NoCampaignsCTA } from '@/components/no-campaigns-cta'

export default async function Home() {
  const campaign = await getFeaturedCampaign()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {campaign ? <CampaignHero campaign={campaign} /> : <NoCampaignsCTA />}
    </main>
  )
}
