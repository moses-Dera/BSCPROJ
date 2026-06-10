'use client'

import { useQuery } from '@tanstack/react-query'
import { universitiesApi } from '@/lib/api/misc.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { CardSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorState } from '@/components/shared/EmptyState'
import { ROUTES } from '@/lib/constants'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PlatformDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['universities'],
    queryFn:  () => universitiesApi.list().then((r: any) => ({
      items: r.data.data,
      total: r.data.pagination.total
    })),
  })

  const total    = data?.total    ?? 0
  const active   = data?.items?.filter((u: any) => u.isActive).length  ?? 0
  const suspended = data?.items?.filter((u: any) => !u.isActive).length ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Dashboard"
        subtitle="UniClear operator overview"
        actions={
          <Link href={ROUTES.platform.universities}>
            <Button>Manage Universities →</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        {isLoading ? (
          <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
        ) : isError ? (
          <ErrorState />
        ) : (
          <>
            <Card>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Total Universities</p>
              <p className="text-3xl font-bold text-[var(--color-text)]">{total}</p>
            </Card>
            <Card>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Active</p>
              <p className="text-3xl font-bold text-[var(--color-approved)]">{active}</p>
            </Card>
            <Card>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide font-medium mb-1">Suspended</p>
              <p className="text-3xl font-bold text-[var(--color-rejected)]">{suspended}</p>
            </Card>
          </>
        )}
      </div>

      {/* Recent universities */}
      {!isLoading && !isError && !!data?.items?.length && (
        <Card>
          <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Universities</h2>
          <div className="space-y-2">
            {data.items.slice(0, 8).map((u: any) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: u.primaryColor ?? '#1B4F72' }}>
                    {u.abbreviation ?? u.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{u.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{u.slug}.uniclear.ng</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {u.isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
