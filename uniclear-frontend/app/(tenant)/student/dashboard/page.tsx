'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { useClearanceStatus } from '@/features/clearance/hooks/useClearance'
import { useStages } from '@/features/stages/hooks/useStages'
import { ClearanceStepper } from '@/components/student/ClearanceStepper'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorState } from '@/components/shared/EmptyState'
import { ROUTES } from '@/lib/constants'
import Link from 'next/link'

export default function StudentDashboard() {
  const user = useAuthStore(s => s.user)
  const { data: clearance, isLoading: loadingClearance, isError } = useClearanceStatus(user?.id ?? '')
  const { data: stages, isLoading: loadingStages } = useStages()

  if (isError) return <ErrorState />
  const isLoading = loadingClearance || loadingStages

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={`Welcome back`}
        subtitle="Track your clearance progress below"
      />

      {/* Clearance status card */}
      {isLoading ? <CardSkeleton /> : clearance && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Clearance Status</p>
              <StatusBadge status={clearance.status} />
            </div>
            {clearance.status === 'COMPLETED' && (
              <Link href={ROUTES.student.certificate}>
                <Button size="sm">🎉 Download Certificate</Button>
              </Link>
            )}
          </div>

          {stages && (
            <ClearanceStepper stages={stages} request={clearance} />
          )}
        </Card>
      )}

      {/* Current stage action card */}
      {clearance && clearance.status === 'IN_PROGRESS' && (
        <Card className="border-l-4 border-l-[var(--color-primary)]">
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Current Step</p>
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-3">
            {stages?.find(s => s.id === clearance.currentStageId)?.name ?? 'Current Stage'}
          </h3>
          <Link href={ROUTES.student.documents}>
            <Button>Continue Clearance →</Button>
          </Link>
        </Card>
      )}

      {!clearance && !isLoading && (
        <Card className="text-center py-10">
          <p className="text-4xl mb-3">🎓</p>
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">No active clearance</h3>
          <p className="text-sm text-[var(--color-muted)] mb-4">Start your clearance process for the current session.</p>
          <Link href={ROUTES.student.clearance}>
            <Button>Start Clearance</Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
