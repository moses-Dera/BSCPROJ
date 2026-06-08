import { apiClient } from './client'
import type { ClearanceRequest } from '@/types'

export const clearanceApi = {
  getStatus:   (studentId: string) =>
    apiClient.get<{ success: true; data: ClearanceRequest }>(`/clearance?studentId=${studentId}`),

  start:       (sessionId: string) =>
    apiClient.post<{ success: true; data: ClearanceRequest }>('/clearance/start', { sessionId }),

  submit:      (requestId: string) =>
    apiClient.post(`/clearance/${requestId}/submit`, {}),

  approve:     (requestId: string, remarks?: string) =>
    apiClient.post(`/clearance/${requestId}/approve`, { remarks }),

  reject:      (requestId: string, remarks: string) =>
    apiClient.post(`/clearance/${requestId}/reject`, { remarks }),

  getQueue:    (page = 1, limit = 20, search?: string) =>
    apiClient.get(`/clearance/queue?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`),

  getHistory:  (requestId: string) =>
    apiClient.get(`/clearance/${requestId}/history`),

  getCertificate: (requestId: string) =>
    apiClient.get(`/clearance/${requestId}/certificate`),
}
