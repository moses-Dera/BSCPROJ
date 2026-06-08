export interface CreateStudentDto {
  email: string
  matricNo: string
  firstName: string
  lastName: string
  facultyId?: string
  departmentId?: string
  level?: string
  phone?: string
}

export interface UpdateStudentDto {
  firstName?: string
  lastName?: string
  facultyId?: string
  departmentId?: string
  level?: string
  phone?: string
}

export interface ImportStudentRow {
  email: string
  matricNo: string
  firstName: string
  lastName: string
  faculty?: string
  department?: string
  level?: string
}
