import { z } from 'zod'

export const createStageSchema = z.object({
  name:        z.string().min(1),
  description: z.string().optional(),
  orderIndex:  z.number().int().min(1),
  officerId:   z.string().uuid().optional(),
})

export const updateStageSchema = z.object({
  name:        z.string().min(1).optional(),
  description: z.string().optional(),
  officerId:   z.string().uuid().nullable().optional(),
})

export const reorderStagesSchema = z.object({
  stages: z.array(z.object({ id: z.string().uuid(), orderIndex: z.number().int().min(1) })),
})
