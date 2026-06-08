'use client'

import { Menu, Bell, LogOut } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { getInitials } from '@/lib/utils/format'

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  const toggleSidebar = useUIStore(s => s.toggleSidebar)
  const unreadCount   = useNotificationStore(s => s.unreadCount)
  const { mutate: logout, isPending } = useLogout()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-muted)] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && <h1 className="text-sm font-semibold text-[var(--color-text)]">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="relative p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-muted)] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-[var(--color-rejected)] text-white text-[10px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-[var(--color-border)]">
          <div className="h-8 w-8 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">
            {useAuthStore.getState().user ? getInitials(useAuthStore.getState().user!.email) : '?'}
          </div>
          <button
            onClick={() => logout()}
            disabled={isPending}
            className="text-[var(--color-muted)] hover:text-[var(--color-rejected)] transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
