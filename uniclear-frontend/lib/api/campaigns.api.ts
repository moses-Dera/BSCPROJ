import { apiClient } from './client'
import type { ClearanceCampaign } from '@/types'

export const campaignsApi = {
  list:       () => apiClient.get<{ success: true; data: ClearanceCampaign[] }>('/campaigns'),
  listActive: () => apiClient.get<{ success: true; data: ClearanceCampaign[] }>('/campaigns/active'),
  create:     (data: Partial<ClearanceCampaign>) => apiClient.post('/campaigns', data),
  update:     (id: string, data: Partial<ClearanceCampaign>) => apiClient.patch(`/campaigns/${id}`, data),
  toggle:     (id: string) => apiClient.patch(`/campaigns/${id}/toggle`),
  delete:     (id: string) => apiClient.delete(`/campaigns/${id}`),
}
