'use client'

import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  const toggleSidebar   = useUIStore(s => s.toggleSidebar)
  const sidebarOpen     = useUIStore(s => s.sidebarOpen)
  const user            = useAuthStore(s => s.user)
  const unreadCount     = useNotificationStore(s => s.unreadCount)
  const { mutate: logout, isPending } = useLogout()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-muted)] transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {title && <h1 className="text-sm font-semibold text-[var(--color-text)]">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          className="relative p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-muted)] transition-colors"
          aria-label="Notifications"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-[var(--color-rejected)] text-white text-[10px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar + logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-[var(--color-border)]">
          <div className="h-8 w-8 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">
            {user ? getInitials(`${user.email}`) : '?'}
          </div>
          <button
            onClick={() => logout()}
            disabled={isPending}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-rejected)] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
