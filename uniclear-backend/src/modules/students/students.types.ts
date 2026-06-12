export interface CreateStudentDto {
  email?:       string
  jambRegNo:    string
  matricNo?:    string
  firstName:    string
  lastName:     string
  facultyId?:   string
  departmentId?: string
  entrySessionId?: string
  level?:       string
  phone?:       string
}

export interface UpdateStudentDto {
  firstName?:   string
  lastName?:    string
  jambRegNo?:   string
  matricNo?:    string
  facultyId?:   string
  departmentId?: string
  level?:       string
  phone?:       string
}

export interface ImportStudentRow {
  email:      string
  jambRegNo:  string
  firstName:  string
  lastName:   string
  faculty?:   string
  department?: string
  level?:     string
}
