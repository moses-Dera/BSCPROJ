'use client'

import { useClearanceStatus } from '@/features/clearance/hooks/useClearance'
import { useStages } from '@/features/stages/hooks/useStages'
import { ClearanceStepper } from '@/components/student/ClearanceStepper'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { ROUTES } from '@/lib/constants'
import { Download, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboard() {
  const { data: clearance, isLoading: loadingClearance } = useClearanceStatus()
  const { data: stages, isLoading: loadingStages } = useStages()
  const isLoading = loadingClearance || loadingStages

  if (isLoading) return <CardSkeleton />

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <PageHeader title="Welcome back" subtitle="Track your clearance progress below" />

      {clearance && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Clearance Status</p>
              <StatusBadge status={clearance.status} />
            </div>
            {clearance.status === 'COMPLETED' && (
              <Link href={ROUTES.student.certificate}>
                <Button size="sm"><Download className="h-3.5 w-3.5 mr-1" /> Certificate</Button>
              </Link>
            )}
          </div>
          {stages && <ClearanceStepper stages={stages} request={clearance} />}
        </Card>
      )}

      {clearance && clearance.status === 'IN_PROGRESS' && (
        <Card className="border-l-4 border-l-[var(--color-primary)]">
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Current Step</p>
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
            {stages?.find(s => s.id === clearance.currentStageId)?.name ?? 'Current Stage'}
          </h3>
          <Link href={ROUTES.student.documents}>
            <Button size="sm">Continue <ArrowRight className="h-3.5 w-3.5" /></Button>
          </Link>
        </Card>
      )}

      {!clearance && (
        <Card className="text-center py-10">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">No active clearance</h3>
          <p className="text-sm text-[var(--color-muted)] mb-4">Start your clearance process for the current session.</p>
          <Link href={ROUTES.student.clearance}>
            <Button>Start Clearance <ArrowRight className="h-3.5 w-3.5" /></Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
