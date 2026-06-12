import { serverFetch } from '@/lib/api/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CertificateBuilder } from '@/components/admin/CertificateBuilder'

async function getCampaign(campaignId: string) {
  try {
    const res = await serverFetch<any>('/campaigns')
    const campaigns = Array.isArray(res) ? res : res.data || []
    return campaigns.find((c: any) => c.id === campaignId) || null
  } catch (err) {
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err
    console.error('Failed to fetch campaign:', err)
    return null
  }
}

export default async function CampaignCertificatePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const campaign = await getCampaign(params.id)

  if (!campaign) {
    return <div className="p-10 text-center">Campaign not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/campaigns">
          <Button variant="secondary" size="sm"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        </Link>
        <PageHeader title={`Certificate Designer`} subtitle={`Configure the clearance certificate for ${campaign.name}`} />
      </div>

      <CertificateBuilder campaign={campaign} />
    </div>
  )
}
