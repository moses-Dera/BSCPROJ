'use client'

import { useAuthStore } from '@/store/useAuthStore'
import { ROLES, type Role } from '@/lib/constants'

export function useRole() {
  const user = useAuthStore(s => s.user)
  const role = user?.role as Role | undefined

  return {
    role,
    is: (r: Role) => role === r,
    isStudent:       role === ROLES.STUDENT,
    isOfficer:       role === ROLES.OFFICER,
    isAdmin:         role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN,
    isSuperAdmin:    role === ROLES.SUPER_ADMIN,
    isPlatformOwner: role === ROLES.PLATFORM_OWNER,
  }
}
