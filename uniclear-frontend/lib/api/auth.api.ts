import { apiClient } from './client'
import type { AuthUser } from '@/types'

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ success: true; data: AuthUser }>('/auth/login', { email, password }),

  logout: () =>
    apiClient.post('/auth/logout'),

  getMe: () =>
    apiClient.get<{ success: true; data: AuthUser }>('/auth/me'),
}
