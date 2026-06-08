import { apiClient } from './client'
import type { Officer, PaginatedData } from '@/types'

export const officersApi = {
  list: (page = 1, limit = 20, stageId?: string) =>
    apiClient.get<{ success: true; data: PaginatedData<Officer> }>(
      `/officers?page=${page}&limit=${limit}${stageId ? `&stageId=${stageId}` : ''}`
    ),
  create: (data: { email: string; firstName: string; lastName: string; stageId?: string }) =>
    apiClient.post<{ success: true; data: Officer }>('/officers', data),
  update: (id: string, data: { firstName?: string; lastName?: string; stageId?: string | null }) =>
    apiClient.patch(`/officers/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/officers/${id}`),
}
