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
  const setTenant   = useTenantStore(s => s.setTenant)
  const sidebarOpen = useUIStore(s => s.sidebarOpen)

  useEffect(() => {
    if (university) {
      setTenant({
        universityId: university.id,
        name:         university.name,
        slug:         university.slug,
        primaryColor: university.branding?.primaryColor ?? '#1B4F72',
        accentColor:  university.branding?.accentColor  ?? '#2980B9',
        logoUrl:      university.branding?.logoUrl      ?? null,
      })
    }
  }, [university, setTenant])

  const primary = university?.branding?.primaryColor ?? '#1B4F72'
  const accent  = university?.branding?.accentColor  ?? '#2980B9'

  return (
    <div
      className="min-h-screen bg-[var(--color-bg)]"
      style={{ '--color-primary': primary, '--color-accent': accent } as React.CSSProperties}
    >
      <Sidebar />
      <div className={cn('transition-all duration-250', sidebarOpen ? 'lg:pl-60' : 'pl-0')}>
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
