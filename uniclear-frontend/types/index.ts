import type { Role } from '@/lib/constants'

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  message: string
  code?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  role: Role
  universityId: string | null
}

// ─── University / Tenant ──────────────────────────────────────────────────────

export interface UniversityBranding {
  primaryColor: string
  accentColor: string
  logoUrl: string | null
  bannerMessage: string | null
  footerText: string | null
}

export interface University {
  id: string
  name: string
  slug: string
  branding: UniversityBranding | null
}

// ─── Clearance ────────────────────────────────────────────────────────────────

export type ClearanceStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

export interface ClearanceStage {
  id: string
  name: string
  orderIndex: number
  isActive: boolean
  officer: { id: string; name: string } | null
}

export interface StageApproval {
  id: string
  stageId: string
  status: ClearanceStatus
  remarks: string | null
  createdAt: string
}

export interface ClearanceRequest {
  id: string
  studentId: string
  universityId: string
  sessionId: string
  status: ClearanceStatus
  currentStageId: string | null
  stages: StageApproval[]
  createdAt: string
}

// ─── Documents ────────────────────────────────────────────────────────────────

export interface DocumentType {
  id: string
  name: string
  description: string | null
  isRequired: boolean
  isActive: boolean
}

export interface Document {
  id: string
  documentTypeId: string
  documentType: DocumentType
  url: string
  key: string
  status: ClearanceStatus
  createdAt: string
}

// ─── Student ──────────────────────────────────────────────────────────────────

export interface Student {
  id: string
  userId: string
  matricNo: string
  fullName: string
  department: string
  faculty: string
  universityId: string
}

// ─── Officer ─────────────────────────────────────────────────────────────────

export interface Officer {
  id: string
  userId: string
  fullName: string
  email: string
  stageId: string | null
  stage: ClearanceStage | null
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}
