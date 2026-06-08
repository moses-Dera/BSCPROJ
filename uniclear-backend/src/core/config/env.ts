import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  DATABASE_URL:             z.string().url(),
  JWT_ACCESS_SECRET:        z.string().min(32),
  JWT_REFRESH_SECRET:       z.string().min(32),
  JWT_ACCESS_EXPIRES_IN:    z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN:   z.string().default('7d'),
  PORT:                     z.string().default('5000'),
  NODE_ENV:                 z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL:               z.string().url().default('http://localhost:3000'),
  STORAGE_PROVIDER:         z.enum(['local', 'cloudinary']).default('local'),
  CLOUDINARY_CLOUD_NAME:    z.string().optional(),
  CLOUDINARY_API_KEY:       z.string().optional(),
  CLOUDINARY_API_SECRET:    z.string().optional(),
  CACHE_PROVIDER:           z.enum(['memory', 'redis']).default('memory'),
  REDIS_URL:                z.string().optional(),
}).refine(
  data => data.STORAGE_PROVIDER !== 'cloudinary' || (
    !!data.CLOUDINARY_CLOUD_NAME && !!data.CLOUDINARY_API_KEY && !!data.CLOUDINARY_API_SECRET
  ),
  { message: 'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are required when STORAGE_PROVIDER=cloudinary' }
)

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
