import { z } from 'zod'

export const createStageSchema = z.object({
  name:        z.string().min(1),
  description: z.string().optional(),
  orderIndex:  z.number().int().min(1),
  scope:       z.enum(['UNIVERSITY', 'FACULTY', 'DEPARTMENT']).optional(),
})

export const updateStageSchema = z.object({
  name:        z.string().min(1).optional(),
  description: z.string().optional(),
  scope:       z.enum(['UNIVERSITY', 'FACULTY', 'DEPARTMENT']).optional(),
})

export const reorderStagesSchema = z.object({
  stages: z.array(z.object({ id: z.string().min(1), orderIndex: z.number().int().min(1) })),
})
