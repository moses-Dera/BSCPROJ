'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useOfficerQueue } from '@/features/clearance/hooks/useClearance'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { CheckCircle, Search, Eye } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'
import { formatDateTime } from '@/lib/utils/format'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'

export default function OfficerQueuePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const search = searchParams.get('search') || ''
  const sessionId = searchParams.get('sessionId')
  const campaignId = searchParams.get('campaignId') || ''

  const setQueryParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const { data: sessionsRes } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => import('@/lib/api/misc.api').then(m => m.sessionsApi.list()).then(r => {
      const active = r.data.data.find((s: any) => s.isActive)
      if (active && sessionId === null && !searchParams.has('sessionId')) setQueryParam('sessionId', active.id)
      return r.data
    })
  })

  const { data: campaignsRes } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => import('@/lib/api/campaigns.api').then(m => m.campaignsApi.list()).then(r => r.data)
  })

  const { data, error, isLoading, isError, refetch } = useOfficerQueue(1, search || undefined, sessionId || undefined, campaignId || undefined)

  return (
    <div className="space-y-4">
      <PageHeader title="Pending Queue" subtitle="Students awaiting your review" />

      <div className="flex flex-col sm:flex-row gap-3 items-center mb-4">
        <Input
          placeholder="Search by name or JAMB Reg No..."
          defaultValue={search}
          onBlur={e => setQueryParam('search', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setQueryParam('search', e.currentTarget.value)}
          icon={<Search className="h-4 w-4" />}
          className="max-w-sm flex-1"
        />
        
        <select
          className="text-sm border border-[var(--color-border)] bg-[var(--color-bg)] rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-full sm:w-auto"
          value={sessionId || ''}
          onChange={(e) => setQueryParam('sessionId', e.target.value)}
        >
          <option value="">All Sessions</option>
          {sessionsRes?.data?.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          className="text-sm border border-[var(--color-border)] bg-[var(--color-bg)] rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-full sm:w-auto"
          value={campaignId}
          onChange={(e) => setQueryParam('campaignId', e.target.value)}
        >
          <option value="">All Campaigns</option>
          {campaignsRes?.data?.filter(c => !sessionId || c.sessionId === sessionId).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {isLoading && <LoadingSkeleton rows={5} />}
      {isError && (error as any)?.response?.status === 403 ? (
        <Card padding="sm">
          <EmptyState icon={<CheckCircle className="h-10 w-10 text-amber-500" />} title="No assigned stages" description="You have not been assigned to clear students for any stage yet. Please contact your administrator." />
        </Card>
      ) : isError ? (
        <ErrorState message={(error as any)?.response?.data?.message ?? "We couldn't load your data."} onRetry={() => refetch()} />
      ) : null}

      {!isLoading && !isError && data && (
        <Card padding="sm">
          {!data?.items?.length ? (
            <EmptyState icon={<CheckCircle className="h-10 w-10" />} title="Queue is empty" description="No students pending review at this stage." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[480px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left">
                    <th className="pb-2 px-3 text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wide">JAMB Reg No.</th>
                    <th className="pb-2 px-3 text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wide">Name</th>
                    <th className="pb-2 px-3 text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wide">Submitted</th>
                    <th className="pb-2 px-3 text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wide">Status</th>
                    <th className="pb-2 px-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {data.items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-[var(--color-bg)] transition-colors">
                      <td className="py-2.5 px-3 font-mono">{item.student?.jambRegNo}</td>
                      <td className="py-2.5 px-3 font-medium text-[var(--color-text)]">{item.student?.firstName} {item.student?.lastName}</td>
                      <td className="py-2.5 px-3 text-[var(--color-muted)]">{formatDateTime(item.updatedAt)}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={item.status} /></td>
                      <td className="py-2.5 px-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => router.push(ROUTES.officer.review(item.student?.id))}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
