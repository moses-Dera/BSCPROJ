import { apiClient } from './client'
import type { Student, Notification, PaginatedData } from '@/types'

export const studentsApi = {
  list:   (page = 1, limit = 20, search?: string) =>
    apiClient.get<{ success: true; data: PaginatedData<Student> }>(`/students?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`),
  getById: (id: string) =>
    apiClient.get<{ success: true; data: Student }>(`/students/${id}`),
  create: (data: { email: string; firstName: string; lastName: string; matricNo: string; facultyId?: string; departmentId?: string }) =>
    apiClient.post<{ success: true; data: Student & { inviteLink: string; tempPassword: string } }>('/students', data),
  delete: (id: string) => apiClient.delete(`/students/${id}`),
}

export const notificationsApi = {
  list:       (page = 1) => apiClient.get<{ success: true; data: Notification[] }>(`/notifications?page=${page}`),
  unreadCount: ()        => apiClient.get<{ success: true; data: { count: number } }>('/notifications/unread-count'),
  markRead:   (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),
  markAllRead: ()          => apiClient.patch('/notifications/read-all', {}),
}
