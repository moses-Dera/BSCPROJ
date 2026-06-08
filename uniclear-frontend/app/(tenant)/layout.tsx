import { serverFetch } from '@/lib/api/server'
import type { University } from '@/types'
import { TenantShell } from './TenantShell'

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  let university: University | null = null

  try {
    university = await serverFetch<University>('/universities/me')
  } catch {
    // No tenant context — let middleware handle redirect
  }

  return (
    <TenantShell university={university}>
      {children}
    </TenantShell>
  )
}
