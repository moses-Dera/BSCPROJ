import { cookies } from 'next/headers'
import { PublicBrandingInit } from '@/components/PublicBrandingInit'

const API_URL = process.env.API_URL || 'http://localhost:5000'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const slug = cookieStore.get('tenant_slug')?.value

  let branding: { name: string; slug: string; logoUrl: string | null; primaryColor: string; accentColor: string; loginBgUrl: string | null } | null = null
  if (slug) {
    try {
      const res = await fetch(`${API_URL}/api/v1/universities/branding/${slug}`, { cache: 'no-store' })
      const json = await res.json()
      if (json.success && json.data) branding = json.data
    } catch {}
  }

  const primary = branding?.primaryColor ?? '#1B4F72'
  const accent  = branding?.accentColor  ?? '#2980B9'

  return (
    <div
      style={{
        '--color-primary': primary,
        '--color-accent':  accent,
        '--login-bg-url':  branding?.loginBgUrl ? `url(${branding.loginBgUrl})` : '',
      } as React.CSSProperties}
    >
      <PublicBrandingInit branding={branding} />
      {children}
    </div>
  )
}
