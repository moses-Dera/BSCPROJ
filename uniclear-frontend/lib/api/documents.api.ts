import { apiClient } from './client'
import type { Document, DocumentType } from '@/types'

export const documentsApi = {
  getByRequest: (requestId: string) =>
    apiClient.get<{ success: true; data: Document[] }>(`/documents/request/${requestId}`),

  upload: (requestId: string, documentTypeId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('requestId', requestId)
    form.append('documentTypeId', documentTypeId)
    return apiClient.post<{ success: true; data: Document }>('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  delete:       (id: string) => apiClient.delete(`/documents/${id}`),
  getSignedUrl: (id: string) => apiClient.get(`/documents/${id}/url`),
}

export const documentTypesApi = {
  list: () => apiClient.get<{ success: true; data: DocumentType[] }>('/document-types'),
  getByStage: (stageId: string) =>
    apiClient.get<{ success: true; data: DocumentType[] }>(`/document-types?stageId=${stageId}`),
}
