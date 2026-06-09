'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { sessionsApi } from '@/lib/api/misc.api'
import { clearanceApi } from '@/lib/api/clearance.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { CalendarDays, ArrowRight } from 'lucide-react'
import { ErrorState, EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants'

export default function StudentClearancePage() {
  const router = useRouter()
  const qc     = useQueryClient()

  const { data: sessions, isLoading, isError } = useQuery({
    queryKey: ['sessions'],
    queryFn:  () => sessionsApi.list().then(r => r.data.data),
  })

  const { mutate: start, isPending } = useMutation({
    mutationFn: (sessionId: string) => clearanceApi.start(sessionId),
    onSuccess:  () => {
      toast.success('Clearance started!')
      qc.invalidateQueries({ queryKey: ['clearance'] })
      router.push(ROUTES.student.dashboard)
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to start clearance'),
  })

  const activeSession = sessions?.find((s: any) => s.isActive)

  if (isLoading) return <LoadingSkeleton rows={2} />
  if (isError)   return <ErrorState />

  return (
    <div className="max-w-md mx-auto space-y-6">
      <PageHeader title="Start Clearance" subtitle="Begin your clearance process for the current session" />

      {!activeSession ? (
        <EmptyState icon={<CalendarDays className="h-10 w-10" />} title="No active session" description="The university has not opened a clearance session yet. Check back later." />
      ) : (
        <Card className="text-center py-8 space-y-4">
          <p className="text-[var(--color-muted)] text-4xl">🎓</p>
          <div>
            <p className="text-base font-semibold text-[var(--color-text)]">{activeSession.name}</p>
            <p className="text-sm text-[var(--color-muted)]">
              {formatDate(activeSession.startDate)} — {formatDate(activeSession.endDate)}
            </p>
          </div>
          <p className="text-sm text-[var(--color-muted)] max-w-xs mx-auto">
            Once started, you will be taken through each clearance stage sequentially.
          </p>
          <Button size="lg" loading={isPending} onClick={() => start(activeSession.id)}>
            Start Clearance <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      )}
    </div>
  )
}
