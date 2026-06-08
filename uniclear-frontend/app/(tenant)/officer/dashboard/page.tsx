'use client'

import { useQuery } from '@tanstack/react-query'
import { useOfficerQueue } from '@/features/clearance/hooks/useClearance'
import { useAuthStore } from '@/store/useAuthStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDateTime } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants'
import Link from 'next/link'

export default function OfficerDashboard() {
  const user = useAuthStore(s => s.user)
  const { data, isLoading } = useOfficerQueue(1)

  const pending   = data?.items?.length ?? 0

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Officer Dashboard" subtitle="Your pending review queue" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          <><CardSkeleton /><CardSkeleton /></>
        ) : (
          <>
            <Card>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-[var(--color-text)]">{pending}</p>
              <p className="text-xs text-[var(--color-pending)] mt-1">⏳ Awaiting your action</p>
            </Card>
            <Card>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Your Stage</p>
              <p className="text-base font-semibold text-[var(--color-text)] mt-2">
                {data?.items?.[0]?.currentStage?.name ?? '—'}
              </p>
              <Link href={ROUTES.officer.queue} className="mt-3 inline-block">
                <Button size="sm">View Queue →</Button>
              </Link>
            </Card>
          </>
        )}
      </div>

      {/* Recent submissions */}
      {!isLoading && !!data?.items?.length && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Recent Submissions</h2>
            <Link href={ROUTES.officer.queue}>
              <Button size="sm" variant="ghost">View all →</Button>
            </Link>
          </div>
          <div className="space-y-2">
            {data.items.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {item.student?.firstName} {item.student?.lastName}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] font-mono">{item.student?.matricNo}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-[var(--color-muted)]">{formatDateTime(item.updatedAt)}</p>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
