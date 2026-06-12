import { apiClient } from './client'
import type { ClearanceCampaign } from '@/types'

export const campaignsApi = {
  list:       () => apiClient.get<{ success: true; data: ClearanceCampaign[] }>('/campaigns'),
  listActive: () => apiClient.get<{ success: true; data: ClearanceCampaign[] }>('/campaigns/active'),
  create:     (data: { name: string; description?: string; sessionId: string; eligibilityRules?: any[]; issuesCertificate?: boolean; issuesClearanceSlip?: boolean; issuedDataFields?: string[] }) => apiClient.post('/campaigns', data),
  update:     (id: string, data: Partial<ClearanceCampaign>) => apiClient.patch(`/campaigns/${id}`, data),
  toggle:     (id: string) => apiClient.patch(`/campaigns/${id}/toggle`),
  delete:     (id: string) => apiClient.delete(`/campaigns/${id}`),
  uploadCertificateTemplate: (id: string, file: File) => {
    const form = new FormData(); form.append('file', file)
    return apiClient.post(`/campaigns/${id}/certificate`, form)
  },
}
