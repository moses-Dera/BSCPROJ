import { apiClient } from './client'
import type { AuthUser } from '@/types'

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ success: true; data: AuthUser }>('/auth/login', { email, password }, { baseURL: '/api' }),

  register: (universitySlug: string, jambRegNo: string, email: string, password: string) =>
    apiClient.post<{ success: true; data: AuthUser }>('/auth/register', { universitySlug, jambRegNo, email, password }, { baseURL: '/api' }),

  logout: () =>
    apiClient.post('/auth/logout', {}, { baseURL: '/api' }),

  getMe: () =>
    apiClient.get<{ success: true; data: AuthUser }>('/auth/me'),

  setPassword: (password: string, confirmPassword: string) =>
    apiClient.post('/auth/set-password', { password, confirmPassword }),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string, confirmPassword: string) =>
    apiClient.post('/auth/reset-password', { token, password, confirmPassword }),
}
