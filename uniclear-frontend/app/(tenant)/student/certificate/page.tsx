'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { useTenantStore } from '@/store/useTenantStore'
import { useClearanceStatus } from '@/features/clearance/hooks/useClearance'
import { clearanceApi } from '@/lib/api/clearance.api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { Lock, PartyPopper, Download } from 'lucide-react'
import { ErrorState, EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils/format'
import { StatusBadge } from '@/components/shared/StatusBadge'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

export default function CertificatePage() {
  const user    = useAuthStore(s => s.user)
  const tenant  = useTenantStore()

  const { data: clearance, isLoading, isError } = useClearanceStatus(user?.id ?? '')

  const { data: _certificate } = useQuery({
    queryKey: ['certificate', clearance?.id],
    queryFn:  () => clearanceApi.getCertificate(clearance!.id).then((r: any) => r.data.data),
    enabled:  !!clearance?.id && clearance.status === 'COMPLETED',
  })

  if (isLoading) return <LoadingSkeleton rows={4} />
  if (isError)   return <ErrorState />
  if (!clearance || clearance.status !== 'COMPLETED') {
    return (
      <EmptyState
        icon={<Lock className="h-10 w-10" />}
        title="Certificate not available"
        description="Your clearance must be fully completed before you can download your certificate."
        action={{ label: '← Back to Dashboard', onClick: () => window.location.href = ROUTES.student.dashboard }}
      />
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Celebration header */}
      <div className="text-center py-6">
        <PartyPopper className="h-12 w-12 text-[var(--color-primary)] mb-3 mx-auto" />
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Clearance Complete!</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Congratulations! All your clearance stages have been approved.
        </p>
      </div>

      {/* Certificate card */}
      <Card className="border-2 border-[var(--color-primary)] text-center space-y-4 py-8">
        <div
          className="h-16 w-16 rounded-xl mx-auto flex items-center justify-center text-white text-2xl font-bold"
          style={{ backgroundColor: tenant.primaryColor }}
        >
          {tenant.name?.[0] ?? 'U'}
        </div>

        <div>
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">University Clearance Certificate</p>
          <p className="text-lg font-bold text-[var(--color-text)] mt-1">{tenant.name}</p>
        </div>

        <div className="border-t border-b border-[var(--color-border)] py-4 space-y-1">
          <p className="text-sm text-[var(--color-muted)]">This certifies that</p>
          <p className="text-base font-semibold text-[var(--color-text)]">
            {clearance.student?.firstName} {clearance.student?.lastName}
          </p>
          <p className="text-xs font-mono text-[var(--color-muted)]">{clearance.student?.matricNo}</p>
          <p className="text-sm text-[var(--color-muted)] mt-2">
            has satisfactorily completed all clearance requirements
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <StatusBadge status="COMPLETED" />
          <span className="text-xs text-[var(--color-muted)]">
            {clearance.completedAt ? formatDate(clearance.completedAt) : ''}
          </span>
        </div>

        <Button size="lg" className="w-full mt-2">
          <Download className="h-4 w-4 mr-2" /> Download PDF Certificate
        </Button>
      </Card>

      <div className="text-center">
        <Link href={ROUTES.student.dashboard} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
