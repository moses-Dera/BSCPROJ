import { z } from 'zod'

export const createUniversitySchema = z.object({
  name:         z.string().min(1),
  slug:         z.string().min(2).max(20).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, or hyphens'),
  abbreviation: z.string().min(1),
  address:      z.string().min(1),
  contactEmail: z.string().email(),
  website:      z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1B4F72'),
  accentColor:  z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#2980B9'),
  tier:         z.enum(['TRIAL', 'STANDARD', 'ENTERPRISE']).default('TRIAL'),
})

export const updateUniversitySchema = z.object({
  name:         z.string().min(1).optional(),
  abbreviation: z.string().min(1).optional(),
  address:      z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  website:      z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor:  z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export const updateContractSchema = z.object({
  tier:        z.enum(['TRIAL', 'STANDARD', 'ENTERPRISE']),
  contractRef: z.string().optional(),
  expiresAt:   z.coerce.date().optional(),
  notes:       z.string().optional(),
})
