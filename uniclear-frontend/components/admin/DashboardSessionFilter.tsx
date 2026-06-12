'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function DashboardSessionFilter({ sessions, baseUrl = '/admin/dashboard' }: { sessions: { id: string; name: string }[], baseUrl?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSessionId = searchParams.get('sessionId') || ''

  return (
    <select
      className="text-sm border border-[var(--color-border)] bg-[var(--color-bg)] rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      value={currentSessionId || sessions.find((s: any) => s.isActive)?.id || 'all'}
      onChange={(e) => {
        const val = e.target.value
        router.push(`${baseUrl}?sessionId=${val}`)
      }}
    >
      <option value="all">All Sessions (Global)</option>
      {sessions.map(s => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  )
}
