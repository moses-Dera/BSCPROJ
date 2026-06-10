import { serverFetch } from '@/lib/api/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

async function getSummary() {
  return serverFetch<{
    totalStudents: number
    totalClearances: number
    completed: number
    inProgress: number
    completionRate: string
    avgProcessingDays: number
    departmentRates: { name: string; total: number; completed: number; rate: number }[]
  }>('/reports/summary')
}

async function getStageBreakdown() {
  return serverFetch<{ stage: { name: string }; pending: number; approved: number; rejected: number }[]>('/reports/by-stage')
}

export default async function AdminDashboard() {
  const [summary, stages] = await Promise.all([getSummary(), getStageBreakdown()])

  const statCards = [
    { label: 'Students',    value: summary.totalStudents,        icon: Users,         note: '' },
    { label: 'Cleared',     value: summary.completed,            icon: CheckCircle,   note: `${summary.completionRate}%` },
    { label: 'In Progress', value: summary.inProgress,           icon: Clock,         note: '' },
    { label: 'Avg Process', value: summary.avgProcessingDays,    icon: Clock,         note: 'Days to clear' },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" subtitle="Clearance activity overview" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, note }) => (
          <Card key={label} padding="md">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] text-[var(--color-muted)] font-medium uppercase tracking-wide">{label}</p>
              <Icon className="h-3.5 w-3.5 text-[var(--color-muted)] shrink-0" />
            </div>
            <p className="text-xl font-bold text-[var(--color-text)] truncate">{value}</p>
            {note && <p className="text-[11px] text-[var(--color-muted)] mt-0.5">{note}</p>}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Clearance Funnel Analytics</h2>
            <div className="flex gap-4 text-[11px] font-medium">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Approved</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-400"></span> Pending</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500"></span> Rejected</span>
            </div>
          </div>
          <div className="space-y-5">
            {stages.map(row => {
              const total = Math.max(row.approved + row.pending + row.rejected, 1)
              const approvedPct = (row.approved / total) * 100
              const pendingPct = (row.pending / total) * 100
              const rejectedPct = (row.rejected / total) * 100

              return (
                <div key={row.stage.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-[var(--color-text)]">{row.stage.name}</p>
                    <div className="flex gap-3 text-xs shrink-0 ml-2 font-medium">
                      <span className="text-emerald-600">{row.approved}</span>
                      <span className="text-yellow-600">{row.pending}</span>
                      <span className="text-red-600">{row.rejected}</span>
                    </div>
                  </div>
                  <div className="bg-[var(--color-bg-secondary)] rounded-full h-2.5 overflow-hidden flex border border-[var(--color-border)] shadow-inner">
                    {approvedPct > 0 && <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${approvedPct}%` }} title={`Approved: ${row.approved}`} />}
                    {pendingPct > 0 && <div className="bg-yellow-400 h-full transition-all duration-500" style={{ width: `${pendingPct}%` }} title={`Pending: ${row.pending}`} />}
                    {rejectedPct > 0 && <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${rejectedPct}%` }} title={`Rejected: ${row.rejected}`} />}
                  </div>
                </div>
              )
            })}
            {stages.length === 0 && (
              <div className="text-center py-6 text-sm text-[var(--color-muted)]">No active clearance stages found.</div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Department Clearance Rates</h2>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {summary.departmentRates?.slice(0, 8).map(dept => (
              <div key={dept.name}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-[var(--color-text)] truncate pr-4">{dept.name}</p>
                  <p className="text-[11px] text-[var(--color-muted)] shrink-0">{dept.completed} / {dept.total}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[var(--color-bg-secondary)] rounded-full h-1.5 overflow-hidden flex-1">
                    <div className="bg-[var(--color-primary)] h-full transition-all duration-500" style={{ width: `${dept.rate}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--color-text)] w-8 text-right">{dept.rate}%</span>
                </div>
              </div>
            ))}
            {(!summary.departmentRates || summary.departmentRates.length === 0) && (
              <div className="text-center py-6 text-sm text-[var(--color-muted)]">No department data available.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
