import { PageHeader } from '@/components/layout/PageHeader'
import { StageBuilder } from '@/components/admin/StageBuilder'

export default function AdminStagesPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Clearance Stages"
        subtitle="Drag to reorder. Changes save automatically."
      />
      <StageBuilder />
    </div>
  )
}
