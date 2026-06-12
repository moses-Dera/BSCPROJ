import { apiClient } from './client'
import type { Student, Notification, PaginatedResponse } from '@/types'

export const studentsApi = {
  list:   (page = 1, limit = 20, search?: string) =>
    apiClient.get<PaginatedResponse<Student>>(`/students?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`),
  getById: (id: string) =>
    apiClient.get<{ success: true; data: Student }>(`/students/${id}`),
  create: (data: { email: string; firstName: string; lastName: string; jambRegNo: string; facultyId?: string; departmentId?: string; matricNo?: string }) =>
    apiClient.post<{ success: true; data: Student & { inviteLink: string; tempPassword: string } }>('/students', data),
  bulkCreate: (data: Array<{ email: string; firstName: string; lastName: string; jambRegNo: string; facultyId?: string; departmentId?: string }>) =>
    apiClient.post<{ success: true; data: { created: number; errors: any[] } }>('/students/bulk', data),
  update: (id: string, data: { jambRegNo?: string; firstName?: string; lastName?: string }) =>
    apiClient.patch(`/students/${id}`, data),
  delete: (id: string) => apiClient.delete(`/students/${id}`),
  getClearanceProgress: (id: string) => apiClient.get<{ success: true; data: any }>(`/students/${id}/clearance`),
}

export const notificationsApi = {
  list:       (page = 1) => apiClient.get<{ success: true; data: Notification[] }>(`/notifications?page=${page}`),
  unreadCount: ()        => apiClient.get<{ success: true; data: { count: number } }>('/notifications/unread-count'),
  markRead:   (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),
  markAllRead: ()          => apiClient.patch('/notifications/read-all', {}),
}
