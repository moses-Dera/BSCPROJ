import { apiClient } from './client'

export const structureApi = {
  getFaculties: () => apiClient.get<{ success: true; data: any[] }>('/structure/faculties'),
  getDepartments: () => apiClient.get<{ success: true; data: any[] }>('/structure/departments'),
  createFaculty: (name: string) => apiClient.post<{ success: true; data: any }>('/structure/faculties', { name }),
  createDepartment: (facultyId: string, name: string) => apiClient.post<{ success: true; data: any }>('/structure/departments', { facultyId, name }),
  deleteFaculty: (id: string) => apiClient.delete(`/structure/faculties/${id}`),
  deleteDepartment: (id: string) => apiClient.delete(`/structure/departments/${id}`)
}
