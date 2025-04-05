import { PurchaseForm } from "@/components/purchase-form"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PurchasePage({ params }: PageProps) {
  const resolvedParams = await params
  return <PurchaseForm campaignId={resolvedParams.id} />
} 