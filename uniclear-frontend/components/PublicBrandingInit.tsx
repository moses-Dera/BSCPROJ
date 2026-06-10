'use client'

import { useEffect } from 'react'
import { useTenantStore } from '@/store/useTenantStore'

interface PublicBranding {
  name: string
  slug: string
  logoUrl: string | null
  primaryColor: string
  accentColor: string
  loginBgUrl: string | null
}

export function PublicBrandingInit({ branding }: { branding: PublicBranding | null }) {
  const setTenant = useTenantStore(s => s.setTenant)
  const resetTenant = useTenantStore(s => s.reset)

  useEffect(() => {
    if (branding) {
      setTenant({
        name:         branding.name,
        slug:         branding.slug,
        logoUrl:      branding.logoUrl,
        primaryColor: branding.primaryColor,
        accentColor:  branding.accentColor,
        loginBgUrl:   branding.loginBgUrl,
      })
    } else {
      resetTenant()
    }
  }, [branding, setTenant, resetTenant])

  return null
}
