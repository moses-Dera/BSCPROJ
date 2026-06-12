'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function DashboardCampaignFilter({ campaigns }: { campaigns: { id: string; name: string }[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCampaignId = searchParams.get('campaignId') || ''

  return (
    <select
      className="text-sm border border-[var(--color-border)] bg-[var(--color-bg)] rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      value={currentCampaignId}
      onChange={(e) => {
        const val = e.target.value
        if (val) {
          router.push(`/admin/dashboard?campaignId=${val}`)
        } else {
          router.push(`/admin/dashboard`)
        }
      }}
    >
      <option value="">All Campaigns (Global)</option>
      {campaigns.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  )
}
