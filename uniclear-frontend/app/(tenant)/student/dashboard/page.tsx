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
  const { data: clearances, isLoading: loadingClearance } = useClearanceStatus()
  const { data: stages, isLoading: loadingStages } = useStages()
  const isLoading = loadingClearance || loadingStages

  if (isLoading) return <CardSkeleton />

  const activeClearances = clearances?.filter(c => c.status !== 'COMPLETED') ?? []
  const completedClearances = clearances?.filter(c => c.status === 'COMPLETED') ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Welcome back" subtitle="Track your clearance progress below" />

      {activeClearances.map(clearance => (
        <Card key={clearance.id}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">
                {clearance.campaign?.name ?? 'Clearance'} • {clearance.session?.name ?? 'Unknown Session'}
              </p>
              <StatusBadge status={clearance.status} />
            </div>
            {clearance.status === 'IN_PROGRESS' && (
              <Link href={ROUTES.student.documents}>
                <Button size="sm">Continue <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            )}
          </div>
          {stages && <ClearanceStepper stages={stages.filter(s => s.campaignId === clearance.campaignId)} request={clearance} />}
        </Card>
      ))}

      {completedClearances.length > 0 && (
        <Card className="border-l-4 border-l-[var(--color-primary)]">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Completed Certificates</h3>
          <div className="space-y-2">
            {completedClearances.map(clearance => (
              <div key={clearance.id} className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-md">
                <span>{clearance.campaign?.name ?? 'Clearance'}</span>
                <Link href={ROUTES.student.certificate}>
                  <Button size="sm" variant="secondary"><Download className="h-3.5 w-3.5 mr-1" /> Certificate</Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(!clearances || clearances.length === 0) && (
        <Card className="text-center py-10">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">No active clearance</h3>
          <p className="text-sm text-[var(--color-muted)] mb-4">Start a clearance process for the current session.</p>
          <Link href={ROUTES.student.clearance}>
            <Button>Start Clearance <ArrowRight className="h-3.5 w-3.5" /></Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
