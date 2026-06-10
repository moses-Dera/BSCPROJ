import { apiClient } from './client'
import { AuditLog, PaginatedData } from '@/types'

export const AuditApi = {
  list: (params?: { page?: number; limit?: number; actorId?: string; targetId?: string }) =>
    apiClient.get<PaginatedData<AuditLog>>('/audit', { params }),
}
