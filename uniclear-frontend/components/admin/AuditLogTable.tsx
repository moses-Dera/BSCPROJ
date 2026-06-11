'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AuditApi } from '@/lib/api/audit.api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function getActionColor(action: string) {
  if (action.includes('APPROVED')) return 'text-[var(--color-approved)] bg-green-50'
  if (action.includes('REJECTED')) return 'text-[var(--color-rejected)] bg-red-50'
  if (action.includes('COMPLETED')) return 'text-[var(--color-primary)] bg-blue-50'
  return 'text-[var(--color-text)] bg-gray-50'
}

export function AuditLogTable() {
  const [page, setPage] = useState(1)
  
  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs', page],
    queryFn: () => AuditApi.list({ page, limit: 15 }).then(res => {
      const payload = res.data as any;
      const actualData = payload.data || payload;
      return {
        items: actualData.items || [],
        total: actualData.pagination?.total || actualData.total || 0,
        limit: actualData.pagination?.limit || actualData.limit || 15
      }
    })
  })

  if (isLoading) {
    return <div className="text-[var(--color-muted)] text-sm animate-pulse">Loading audit logs...</div>
  }

  return (
    <div className="space-y-4">
      <Card padding="sm" className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left bg-gray-50/50">
              <th className="pb-3 pt-3 px-4 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Timestamp</th>
              <th className="pb-3 pt-3 px-4 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Action</th>
              <th className="pb-3 pt-3 px-4 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Actor Email</th>
              <th className="pb-3 pt-3 px-4 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Target</th>
              <th className="pb-3 pt-3 px-4 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data?.items.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[var(--color-muted)]">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-[var(--color-text)]">
                  <div>{log.actor?.email}</div>
                  <div className="text-xs text-[var(--color-muted)]">{log.actor?.role}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-[var(--color-text)]">{log.targetType}</div>
                  <div className="text-xs text-[var(--color-muted)] font-mono">{log.targetId?.slice(0,8)}...</div>
                </td>
                <td className="py-3 px-4 text-[var(--color-muted)] text-xs font-mono">
                  {log.ipAddress || 'Unknown'}
                </td>
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--color-muted)]">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Pagination Controls */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
          <div>
            Showing {(page - 1) * data.limit + 1} to {Math.min(page * data.limit, data.total)} of {data.total} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page * data.limit >= data.total}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
