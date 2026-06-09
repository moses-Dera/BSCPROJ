'use client'

import { useTenantStore } from '@/store/useTenantStore'

export function useTenant() {
  const universityId  = useTenantStore(s => s.universityId)
  const name          = useTenantStore(s => s.name)
  const slug          = useTenantStore(s => s.slug)
  const primaryColor  = useTenantStore(s => s.primaryColor)
  const accentColor   = useTenantStore(s => s.accentColor)
  const logoUrl       = useTenantStore(s => s.logoUrl)

  return { universityId, name, slug, primaryColor, accentColor, logoUrl }
}
