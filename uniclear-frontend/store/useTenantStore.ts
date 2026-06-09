import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TenantState {
  universityId: string | null
  name: string
  slug: string
  primaryColor: string
  accentColor: string
  logoUrl: string | null
  loginBgUrl: string | null
  setTenant: (data: Partial<Omit<TenantState, 'setTenant'>>) => void
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      universityId: null,
      name: '',
      slug: '',
      primaryColor: '#1B4F72',
      accentColor: '#2980B9',
      logoUrl: null,
      loginBgUrl: null,
      setTenant: (data) => set(data),
    }),
    { name: 'uniclear-tenant' }
  )
)
