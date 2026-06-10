import { PageHeader } from '@/components/layout/PageHeader'
import { StageBuilder } from '@/components/admin/StageBuilder'

export default async function AdminStagesPage({ searchParams }: { searchParams: Promise<{ campaignId?: string }> }) {
  const { campaignId } = await searchParams
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Clearance Stages"
        subtitle="Drag to reorder. Changes save automatically."
      />
      {campaignId ? (
        <StageBuilder campaignId={campaignId} />
      ) : (
        <div className="p-4 border rounded bg-amber-50 text-amber-800">
          Please select a campaign from the Campaigns page first.
        </div>
      )}
    </div>
  )
}
