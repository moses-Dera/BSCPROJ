import { serverFetch } from '@/lib/api/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'

export default async function AdminReportsPage() {
  const [summary, stages] = await Promise.all([
    serverFetch<any>('/reports/summary'),
    serverFetch<any[]>('/reports/by-stage'),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Clearance analytics for this session" />

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students',    value: summary.totalStudents   },
          { label: 'Total Clearances',  value: summary.totalClearances },
          { label: 'Completed',         value: summary.completed       },
          { label: 'Completion Rate',   value: `${summary.completionRate}%` },
        ].map(c => (
          <Card key={c.label}>
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-[var(--color-text)]">{c.value}</p>
          </Card>
        ))}
      </div>

      {/* Stage breakdown table */}
      <Card padding="sm">
        <h2 className="text-sm font-semibold text-[var(--color-text)] px-3 py-3">Stage Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left">
              <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Stage</th>
              <th className="pb-3 px-3 text-xs font-medium text-[var(--color-pending)] uppercase tracking-wide">Pending</th>
              <th className="pb-3 px-3 text-xs font-medium text-[var(--color-approved)] uppercase tracking-wide">Approved</th>
              <th className="pb-3 px-3 text-xs font-medium text-[var(--color-rejected)] uppercase tracking-wide">Rejected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {stages.map((row: any) => (
              <tr key={row.stage.id} className="hover:bg-[var(--color-bg)] transition-colors">
                <td className="py-3 px-3 font-medium text-[var(--color-text)]">{row.stage.name}</td>
                <td className="py-3 px-3 text-[var(--color-pending)]">{row.pending}</td>
                <td className="py-3 px-3 text-[var(--color-approved)]">{row.approved}</td>
                <td className="py-3 px-3 text-[var(--color-rejected)]">{row.rejected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
