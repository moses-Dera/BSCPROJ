import { apiClient } from './client'
import type { ClearanceRequest } from '@/types'

export const clearanceApi = {
  getStatus:   () =>
    apiClient.get<{ success: true; data: ClearanceRequest[] }>('/clearance/status'),

  start:       (sessionId: string, campaignId: string) =>
    apiClient.post<{ success: true; data: ClearanceRequest }>('/clearance/start', { sessionId, campaignId }),

  submit:      (requestId: string) =>
    apiClient.post(`/clearance/${requestId}/submit`, {}),

  approve: (requestId: string, remarks?: string, file?: File, issuedData?: any) => {
    if (file) {
      const formData = new FormData()
      if (remarks) formData.append('remarks', remarks)
      if (issuedData) formData.append('issuedData', JSON.stringify(issuedData))
      formData.append('file', file)
      return apiClient.post(`/clearance/${requestId}/approve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return apiClient.post(`/clearance/${requestId}/approve`, { remarks, issuedData })
  },

  reject:      (requestId: string, remarks: string) =>
    apiClient.post(`/clearance/${requestId}/reject`, { remarks }),

  getByStudent: (studentId: string) =>
    apiClient.get(`/clearance/by-student/${studentId}`),

  getQueue:    (page = 1, limit = 20, search?: string, sessionId?: string, campaignId?: string) =>
    apiClient.get(`/clearance/queue?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}${sessionId ? `&sessionId=${sessionId}` : ''}${campaignId ? `&campaignId=${campaignId}` : ''}`),

  getHistory:  (requestId: string) =>
    apiClient.get(`/clearance/${requestId}/history`),

  getCertificate: (requestId: string) =>
    apiClient.get(`/clearance/${requestId}/certificate`),
}
