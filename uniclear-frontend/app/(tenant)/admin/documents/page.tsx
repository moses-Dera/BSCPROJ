'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { documentTypesApi } from '@/lib/api/documents.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { FileText } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/shared/EmptyState'

export default function AdminDocumentsPage() {
  const _qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['document-types'],
    queryFn:  () => documentTypesApi.list().then(r => r.data.data),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Types"
        subtitle="Configure required documents for clearance stages"
        actions={<Button>+ Add Document Type</Button>}
      />

      {isLoading && <LoadingSkeleton rows={5} />}
      {isError   && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <Card padding="sm">
          {!data?.length ? (
            <EmptyState icon={<FileText className="h-10 w-10" />} title="No document types" description="Add document types to get started." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left">
                  <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Name</th>
                  <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Formats</th>
                  <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Max Size</th>
                  <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Required</th>
                  <th className="pb-3 px-3 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {data.map((dt: any) => (
                  <tr key={dt.id} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-[var(--color-text)]">{dt.name}</p>
                      {dt.description && <p className="text-xs text-[var(--color-muted)]">{dt.description}</p>}
                    </td>
                    <td className="py-3 px-3 text-[var(--color-muted)] uppercase text-xs">{dt.allowedFormats?.join(', ')}</td>
                    <td className="py-3 px-3 text-[var(--color-muted)]">{dt.maxFileSizeMB}MB</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dt.isRequired ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        {dt.isRequired ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={dt.isActive ? 'APPROVED' : 'REJECTED'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  )
}
