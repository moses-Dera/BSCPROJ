'use client'

import { useTenantStore } from '@/store/useTenantStore'

export function useTenant() {
  return useTenantStore(s => ({
    universityId: s.universityId,
    name:         s.name,
    slug:         s.slug,
    primaryColor: s.primaryColor,
    accentColor:  s.accentColor,
    logoUrl:      s.logoUrl,
  }))
}
