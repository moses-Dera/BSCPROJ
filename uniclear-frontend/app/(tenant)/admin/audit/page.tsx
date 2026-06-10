import { PageHeader } from '@/components/layout/PageHeader'
import { AuditLogTable } from '@/components/admin/AuditLogTable'

export default function AdminAuditPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader 
        title="Global Audit Log" 
        subtitle="Immutable security trail of all actions performed within the clearance system." 
      />
      <AuditLogTable />
    </div>
  )
}
