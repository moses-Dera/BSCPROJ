import { z } from 'zod'

export const createStudentSchema = z.object({
  email:        z.string().email().optional(),
  jambRegNo:    z.string().min(1),
  firstName:    z.string().min(1),
  lastName:     z.string().min(1),
  facultyId:    z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  level:        z.string().optional(),
  phone:        z.string().optional(),
})

export const bulkCreateItemSchema = z.object({
  email:          z.string().email().optional(),
  jambRegNo:      z.string().min(1),
  firstName:      z.string().min(1),
  lastName:       z.string().min(1),
  facultyName:    z.string().optional(),
  departmentName: z.string().optional(),
  sessionName:    z.string().optional(),
  level:          z.string().optional(),
})

export const bulkCreateStudentSchema = z.array(bulkCreateItemSchema)

export const updateStudentSchema = z.object({
  firstName:    z.string().min(1).optional(),
  lastName:     z.string().min(1).optional(),
  matricNo:     z.string().min(1).optional(),
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
