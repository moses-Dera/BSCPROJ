'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils/cn'

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUIStore(s => s.sidebarOpen)

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className={cn('transition-all duration-250', sidebarOpen ? 'lg:pl-60' : 'pl-0')}>
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
