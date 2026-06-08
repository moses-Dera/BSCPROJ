'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, UserCircle, Settings, FileText,
  CalendarDays, BarChart2, Paintbrush, ClipboardList, University,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/store/useUIStore'
import { useRole } from '@/hooks/useRole'
import { useTenant } from '@/hooks/useTenant'
import { ROUTES } from '@/lib/constants'

interface NavItem { label: string; href: string; icon: LucideIcon }

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.admin.dashboard,  icon: LayoutDashboard },
  { label: 'Students',  href: ROUTES.admin.students,   icon: Users },
  { label: 'Officers',  href: ROUTES.admin.officers,   icon: UserCircle },
  { label: 'Stages',    href: ROUTES.admin.stages,     icon: Settings },
  { label: 'Documents', href: ROUTES.admin.documents,  icon: FileText },
  { label: 'Sessions',  href: ROUTES.admin.sessions,   icon: CalendarDays },
  { label: 'Reports',   href: ROUTES.admin.reports,    icon: BarChart2 },
  { label: 'Branding',  href: ROUTES.admin.branding,   icon: Paintbrush },
]

const officerNav: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.officer.dashboard, icon: LayoutDashboard },
  { label: 'Queue',     href: ROUTES.officer.queue,     icon: ClipboardList },
]

const platformNav: NavItem[] = [
  { label: 'Dashboard',    href: ROUTES.platform.dashboard,   icon: LayoutDashboard },
  { label: 'Universities', href: ROUTES.platform.universities, icon: University },
]

export function Sidebar() {
  const pathname   = usePathname()
  const { sidebarOpen } = useUIStore()
  const { isOfficer, isPlatformOwner } = useRole()
  const { name, logoUrl, primaryColor } = useTenant()

  const navItems = isPlatformOwner ? platformNav : isOfficer ? officerNav : adminNav

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] transition-all duration-250',
        sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)]">
        {logoUrl
          ? <Image src={logoUrl} alt={name} width={32} height={32} className="h-8 w-8 rounded object-cover" />
          : <div className="h-8 w-8 rounded flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: primaryColor }}>{name[0]}</div>
        }
        <span className="font-semibold text-sm text-[var(--color-text)] truncate">{name || 'UniClear'}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-sm transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-[var(--color-primary)] text-white font-medium'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
