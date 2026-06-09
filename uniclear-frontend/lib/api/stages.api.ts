import { apiClient } from './client'
import type { ClearanceStage } from '@/types'

export const stagesApi = {
  list:    () => apiClient.get<{ success: true; data: ClearanceStage[] }>('/stages'),
  reorder: (ids: string[]) => apiClient.patch('/stages/reorder', {
    stages: ids.map((id, index) => ({ id, orderIndex: index + 1 }))
  }),
  create:  (data: { name: string; description?: string }) => apiClient.post('/stages', data),
  update:  (id: string, data: Partial<ClearanceStage>)   => apiClient.patch(`/stages/${id}`, data),
  delete:  (id: string) => apiClient.delete(`/stages/${id}`),
}
