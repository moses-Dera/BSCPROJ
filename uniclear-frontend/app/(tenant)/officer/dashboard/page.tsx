'use client'

import { useQuery } from '@tanstack/react-query'
import { useOfficerQueue } from '@/features/clearance/hooks/useClearance'
import { officersApi } from '@/lib/api/officers.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDateTime } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Clock, ArrowRight } from 'lucide-react'

export default function OfficerDashboard() {
  const router = useRouter()
  const { data: queue, error: queueError, isLoading: queueLoading, isError: queueIsError } = useOfficerQueue(1)
  const { data: meRes } = useQuery({
    queryKey: ['officer', 'me'],
    queryFn:  () => officersApi.getMe().then((r: any) => r.data.data),
  })

  if (queueIsError) {
    const errorMsg = (queueError as any)?.response?.data?.message
    if (errorMsg === 'You are not assigned to any stage') {
      return (
        <div className="max-w-3xl space-y-4">
          <PageHeader title="Officer Dashboard" subtitle="Welcome to UniClear" />
          <Card padding="lg" className="text-center py-12">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">No Stage Assigned</h3>
            <p className="text-sm text-[var(--color-muted)] max-w-sm mx-auto">
              Your account has not been assigned to review any clearance stages yet. Please contact the Super Admin to configure your clearance stage assignment.
            </p>
          </Card>
        </div>
      )
    }
  }

  const pending   = queue?.items?.length ?? 0
  const assignment = meRes?.stageAssignments?.[0]
  const stageName = assignment?.stage?.name ?? '—'

  return (
    <div className="max-w-3xl space-y-4">
      <PageHeader title="Officer Dashboard" subtitle="Your pending review queue" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {queueLoading ? (
          <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
        ) : (
          <>
            <Card>
              <p className="text-[11px] text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{pending}</p>
              <p className="text-xs text-[var(--color-pending)] mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Awaiting your action</p>
            </Card>
            <Card>
              <p className="text-[11px] text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Today's Velocity</p>
              <p className="text-2xl font-bold text-emerald-600">{meRes?.todayVelocity ?? 0}</p>
              <p className="text-xs text-[var(--color-muted)] mt-1 flex items-center gap-1">Approvals today</p>
            </Card>
            <Card>
              <p className="text-[11px] text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Your Stage</p>
              <p className="text-sm font-semibold text-[var(--color-text)] mt-1 truncate">{stageName}</p>
              <Link href={ROUTES.officer.queue} className="mt-3 inline-block">
                <Button size="sm">View Queue <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </Card>
            <Card>
              <p className="text-[11px] text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Your Scope</p>
              <div className="mt-1 space-y-1">
                {!assignment?.faculty && !assignment?.department ? (
                  <p className="text-sm font-semibold text-[var(--color-text)] text-[var(--color-primary)]">School Wide</p>
                ) : (
                  <>
                    <p className="text-xs text-[var(--color-text)]"><span className="text-[var(--color-muted)]">Faculty:</span> {assignment?.faculty?.name ?? 'All Faculties'}</p>
                    <p className="text-xs text-[var(--color-text)]"><span className="text-[var(--color-muted)]">Dept:</span> {assignment?.department?.name ?? 'All Departments'}</p>
                  </>
                )}
              </div>
            </Card>
          </>
        )}
      </div>

      {!queueLoading && !!queue?.items?.length && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide">Recent Submissions</h2>
            <Link href={ROUTES.officer.queue}>
              <Button size="sm" variant="ghost">View all <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
          <div className="space-y-1">
            {queue.items.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--color-text)] truncate">
                    {item.student?.firstName} {item.student?.lastName}
                  </p>
                  <p className="text-[11px] text-[var(--color-muted)] font-mono">{item.student?.jambRegNo}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <p className="text-[11px] text-[var(--color-muted)] hidden sm:block">{formatDateTime(item.updatedAt)}</p>
                  <StatusBadge status={item.status} />
                  <button
                    onClick={() => router.push(ROUTES.officer.review(item.student?.id))}
                    className="p-1 rounded hover:bg-[var(--color-bg)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
