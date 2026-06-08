import { create } from 'zustand'

interface TenantState {
  universityId: string | null
  name: string
  slug: string
  primaryColor: string
  accentColor: string
  logoUrl: string | null
  setTenant: (data: Partial<Omit<TenantState, 'setTenant'>>) => void
}

export const useTenantStore = create<TenantState>((set) => ({
  universityId: null,
  name: '',
  slug: '',
  primaryColor: '#1B4F72',
  accentColor: '#2980B9',
  logoUrl: null,
  setTenant: (data) => set(data),
}))
