import { z } from 'zod'

export const createOfficerSchema = z.object({
  email:     z.string().email(),
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  stageId:   z.string().uuid().optional(),
})

export const updateOfficerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName:  z.string().min(1).optional(),
  stageId:   z.string().uuid().nullable().optional(),
})

export const listOfficersSchema = z.object({
  page:    z.coerce.number().default(1),
  limit:   z.coerce.number().default(20),
  stageId: z.string().uuid().optional(),
})
