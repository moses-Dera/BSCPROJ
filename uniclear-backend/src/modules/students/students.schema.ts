import { z } from 'zod'

export const createStudentSchema = z.object({
  email:        z.string().email(),
  matricNo:     z.string().min(1),
  firstName:    z.string().min(1),
  lastName:     z.string().min(1),
  facultyId:    z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  level:        z.string().optional(),
  phone:        z.string().optional(),
})

export const updateStudentSchema = z.object({
  firstName:    z.string().min(1).optional(),
  lastName:     z.string().min(1).optional(),
  facultyId:    z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  level:        z.string().optional(),
  phone:        z.string().optional(),
})

export const listStudentsSchema = z.object({
  page:         z.coerce.number().default(1),
  limit:        z.coerce.number().default(20),
  search:       z.string().optional(),
  facultyId:    z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
})
