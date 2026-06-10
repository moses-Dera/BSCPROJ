import { PageHeader } from '@/components/layout/PageHeader'
import { CampaignList } from '@/components/admin/CampaignList'

export default function AdminCampaignsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Clearance Campaigns"
        subtitle="Manage multiple clearance workflows (e.g. Fresher, Hostel, Graduation)"
      />
      <CampaignList />
    </div>
  )
}
