'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUIStore(s => s.sidebarOpen)
  const user = useAuthStore(s => s.user)
  const router = useRouter()
  const [rehydrated, setRehydrated] = useState(false)

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) { setRehydrated(true); return }
    const unsub = useAuthStore.persist.onFinishHydration(() => setRehydrated(true))
    return unsub
  }, [])

  useEffect(() => {
    if (!rehydrated) return
    if (!user || user.role !== 'PLATFORM_OWNER') {
      router.replace(ROUTES.login)
    }
  }, [rehydrated, user, router])

  if (!rehydrated) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
    </div>
  )

  if (!user || user.role !== 'PLATFORM_OWNER') return null

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
