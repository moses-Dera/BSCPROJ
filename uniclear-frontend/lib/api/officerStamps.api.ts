import { apiClient } from './client'

export interface OfficerStamp {
  id: string
  name: string
  imageUrl: string
  createdAt: string
}

export const officerStampsApi = {
  getAll: () => apiClient.get<{ success: true; data: OfficerStamp[] }>('/officers/stamps'),
  
  upload: (name: string, file: File) => {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('file', file)
    return apiClient.post<{ success: true; data: OfficerStamp }>('/officers/stamps', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  delete: (id: string) => apiClient.delete(`/officers/stamps/${id}`)
}
