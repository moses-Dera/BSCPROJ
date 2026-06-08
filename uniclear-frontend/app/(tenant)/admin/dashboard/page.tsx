import { serverFetch } from '@/lib/api/server'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'

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
    { label: 'Total Students',  value: summary.totalStudents,  icon: '👥', note: '' },
    { label: 'Cleared',         value: summary.completed,      icon: '✅', note: `${summary.completionRate}%` },
    { label: 'In Progress',     value: summary.inProgress,     icon: '⏳', note: '' },
    { label: 'Bottleneck',      value: stages[0]?.stage.name ?? '—', icon: '⚠', note: stages[0] ? `${stages[0].pending} waiting` : '' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Overview of clearance activity" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Card key={card.label} padding="md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--color-muted)] font-medium uppercase tracking-wide">{card.label}</p>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text)]">{card.value}</p>
            {card.note && <p className="text-xs text-[var(--color-muted)] mt-1">{card.note}</p>}
          </Card>
        ))}
      </div>

      {/* Stage breakdown */}
      <Card>
        <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Clearances by Stage</h2>
        <div className="space-y-3">
          {stages.map(row => (
            <div key={row.stage.name} className="flex items-center gap-3">
              <p className="text-sm text-[var(--color-text)] w-36 shrink-0 truncate">{row.stage.name}</p>
              <div className="flex-1 bg-[var(--color-bg)] rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-[var(--color-primary)] transition-all"
                  style={{ width: `${Math.min((row.approved / Math.max(row.approved + row.pending + row.rejected, 1)) * 100, 100)}%` }}
                />
              </div>
              <div className="flex gap-3 text-xs text-[var(--color-muted)] shrink-0">
                <span className="text-[var(--color-pending)]">⏳ {row.pending}</span>
                <span className="text-[var(--color-approved)]">✓ {row.approved}</span>
                <span className="text-[var(--color-rejected)]">✗ {row.rejected}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
