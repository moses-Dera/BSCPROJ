'use client'

import { useState } from 'react'
import { useOfficerQueue, useApproveStage, useRejectStage } from '@/features/clearance/hooks/useClearance'
import { RejectDialog } from '@/components/officer/RejectDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { CheckCircle, Search, Check, X } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { formatDateTime } from '@/lib/utils/format'
import { Card } from '@/components/ui/card'

export default function OfficerQueuePage() {
  const [search, setSearch] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useOfficerQueue(1, search || undefined)
  const { mutate: approve, isPending: approving } = useApproveStage()
  const { mutate: reject, isPending: rejecting } = useRejectStage()

  return (
    <div className="space-y-6">
      <PageHeader title="Pending Queue" subtitle="Students awaiting your review" />

      <Input
        placeholder="Search by name or matric number..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        icon={<Search className="h-4 w-4" />}
        className="max-w-sm"
      />

      {isLoading && <LoadingSkeleton rows={5} />}
      {isError   && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <Card padding="sm">
          {!data?.items?.length ? (
            <EmptyState icon={<CheckCircle className="h-10 w-10" />} title="Queue is empty" description="No students pending review at this stage." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left">
                    <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Matric No.</th>
                    <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Name</th>
                    <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Submitted</th>
                    <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Status</th>
                    <th className="pb-3 px-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {data.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-[var(--color-bg)] transition-colors">
                      <td className="py-3 px-3 font-mono text-xs">{item.student?.matricNo}</td>
                      <td className="py-3 px-3 font-medium">{item.student?.firstName} {item.student?.lastName}</td>
                      <td className="py-3 px-3 text-[var(--color-muted)]">{formatDateTime(item.updatedAt)}</td>
                      <td className="py-3 px-3"><StatusBadge status={item.status} /></td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" onClick={() => approve({ requestId: item.id })} loading={approving}>
                            <Check className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setRejectingId(item.id)}>
                            <X className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {rejectingId && (
        <RejectDialog
          isPending={rejecting}
          onConfirm={(remarks) => {
            reject({ requestId: rejectingId, remarks }, { onSuccess: () => setRejectingId(null) })
          }}
          onCancel={() => setRejectingId(null)}
        />
      )}
    </div>
  )
}
