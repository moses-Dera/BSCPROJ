'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '@/lib/api/students.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { Users, Search } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'

export default function AdminStudentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['students', page, search],
    queryFn:  () => studentsApi.list(page, 20, search || undefined).then(r => r.data.data),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Students" subtitle="All enrolled students" />

      <Input
        placeholder="Search by name or matric number..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1) }}
        icon={<Search className="h-4 w-4" />}
        className="max-w-sm"
      />

      {isLoading && <LoadingSkeleton rows={8} />}
      {isError   && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <Card padding="sm">
          {!data?.items?.length ? (
            <EmptyState icon={<Users className="h-10 w-10" />} title="No students found" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left">
                      <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Matric No.</th>
                      <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Name</th>
                      <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Department</th>
                      <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Faculty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {data.items.map((s: any) => (
                      <tr key={s.id} className="hover:bg-[var(--color-bg)] transition-colors">
                        <td className="py-3 px-3 font-mono text-xs">{s.matricNo}</td>
                        <td className="py-3 px-3 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="py-3 px-3 text-[var(--color-muted)]">{s.department?.name ?? '—'}</td>
                        <td className="py-3 px-3 text-[var(--color-muted)]">{s.faculty?.name ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-muted)]">
                  {data.total} total students
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                  <Button size="sm" variant="secondary" disabled={data.items.length < 20} onClick={() => setPage(p => p + 1)}>Next →</Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  )
}
