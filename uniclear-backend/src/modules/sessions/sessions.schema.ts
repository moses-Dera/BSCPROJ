import { z } from 'zod'

export const createSessionSchema = z.object({
  name:      z.string().min(1),
  startDate: z.coerce.date(),
  endDate:   z.coerce.date(),
})

export const updateSessionSchema = z.object({
  name:      z.string().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate:   z.coerce.date().optional(),
})
