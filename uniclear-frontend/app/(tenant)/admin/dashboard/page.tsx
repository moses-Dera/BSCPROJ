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
    { label: 'Bottleneck',  value: stages[0]?.stage.name ?? '—', icon: AlertTriangle, note: stages[0] ? `${stages[0].pending} waiting` : '' },
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

      <Card>
        <h2 className="text-xs font-semibold text-[var(--color-text)] mb-3 uppercase tracking-wide">Clearances by Stage</h2>
        <div className="space-y-3">
          {stages.map(row => (
            <div key={row.stage.name}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-[var(--color-text)] truncate max-w-[140px]">{row.stage.name}</p>
                <div className="flex gap-2 text-[11px] shrink-0 ml-2">
                  <span className="text-yellow-500">{row.pending}p</span>
                  <span className="text-green-500">{row.approved}a</span>
                  <span className="text-red-500">{row.rejected}r</span>
                </div>
              </div>
              <div className="bg-[var(--color-bg)] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-[var(--color-primary)] transition-all"
                  style={{ width: `${Math.min((row.approved / Math.max(row.approved + row.pending + row.rejected, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[var(--color-muted)] mt-3">p = pending · a = approved · r = rejected</p>
      </Card>
    </div>
  )
}
