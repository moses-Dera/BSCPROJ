import { z } from 'zod'

export const startClearanceSchema = z.object({
  sessionId: z.string().uuid(),
})

export const approveStageSchema = z.object({
  remarks: z.string().optional(),
})

export const rejectStageSchema = z.object({
  remarks: z.string().min(10, 'Please provide a detailed rejection reason (min 10 chars)'),
})

export const queueQuerySchema = z.object({
  page:   z.coerce.number().default(1),
  limit:  z.coerce.number().default(20),
  search: z.string().optional(),
})
