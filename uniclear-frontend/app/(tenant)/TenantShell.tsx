'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { useTenantStore } from '@/store/useTenantStore'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils/cn'
import type { University } from '@/types'

interface TenantShellProps {
  university: University | null
  children: React.ReactNode
}

export function TenantShell({ university, children }: TenantShellProps) {
  const setTenant      = useTenantStore(s => s.setTenant)
  const sidebarOpen    = useUIStore(s => s.sidebarOpen)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)

  useEffect(() => {
    if (university) {
      setTenant({
        universityId: university.id,
        name:         university.name,
        slug:         university.slug,
        primaryColor: university.primaryColor ?? '#1B4F72',
        accentColor:  university.accentColor  ?? '#2980B9',
        logoUrl:      university.logoUrl       ?? null,
      })
    }
  }, [university, setTenant])

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar />

      {/* Mobile overlay — tap to close sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={cn('transition-all duration-250', sidebarOpen ? 'lg:pl-60' : 'pl-0')}>
        <Topbar />
        <main className="p-3 md:p-6">{children}</main>
      </div>
    </div>
  )
}
