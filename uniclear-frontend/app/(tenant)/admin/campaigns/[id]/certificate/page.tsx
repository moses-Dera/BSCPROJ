import { serverFetch } from '@/lib/api/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CertificateBuilder } from '@/components/admin/CertificateBuilder'

async function getCampaign(campaignId: string) {
  const res = await serverFetch<{ data: any[] }>('/campaigns')
  const campaign = res.data?.find((c: any) => c.id === campaignId)
  return campaign || null
}

export default async function CampaignCertificatePage({ params }: { params: { id: string } }) {
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
