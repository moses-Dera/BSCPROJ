import 'client-only'
import { useState } from 'react'
import { Menu, Bell, LogOut } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { getInitials } from '@/lib/utils/format'
import { ProfileSlideOver } from './ProfileSlideOver'
import { toast } from 'sonner'

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  const toggleSidebar = useUIStore(s => s.toggleSidebar)
  const unreadCount   = useNotificationStore(s => s.unreadCount)
  const reset         = useNotificationStore(s => s.reset)
  const { mutate: logout, isPending } = useLogout()
  const [profileOpen, setProfileOpen] = useState(false)

  const user = useAuthStore(s => s.user)

  const handleNotificationsClick = () => {
    if (unreadCount > 0) {
      reset()
      toast.success('All notifications marked as read')
    } else {
      toast.info('No new notifications')
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
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
            onClick={handleNotificationsClick}
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
            <button 
              onClick={() => setProfileOpen(true)}
              className="h-8 w-8 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              {user ? getInitials(user.email) : '?'}
            </button>
            <button
              onClick={() => logout()}
              disabled={isPending}
              className="text-[var(--color-muted)] hover:text-[var(--color-rejected)] transition-colors p-1.5 rounded hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <ProfileSlideOver open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}
