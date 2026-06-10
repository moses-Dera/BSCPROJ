import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from '@/core/swagger/swagger'

import { env } from '@/core/config/env'
import { errorHandler } from '@/core/response/errorHandler'
import { tenantMiddleware } from '@/core/middleware/tenant.middleware'

import authRoutes           from '@/app/api/v1/auth/route'
import studentRoutes        from '@/app/api/v1/students/route'
import officerRoutes        from '@/app/api/v1/officers/route'
import stageRoutes          from '@/app/api/v1/stages/route'
import documentTypeRoutes   from '@/app/api/v1/document-types/route'
import documentRoutes       from '@/app/api/v1/documents/route'
import clearanceRoutes      from '@/app/api/v1/clearance/route'
import notificationRoutes   from '@/app/api/v1/notifications/route'
import sessionRoutes        from '@/app/api/v1/sessions/route'
import brandingRoutes       from '@/app/api/v1/branding/route'
import universityRoutes     from '@/app/api/v1/universities/route'
import auditRoutes          from '@/app/api/v1/audit/route'
import reportRoutes         from '@/app/api/v1/reports/route'
import structureRoutes      from '@/app/api/v1/structure/route'
import webhookRoutes        from '@/app/api/v1/webhooks/route'
import campaignRoutes       from '@/app/api/v1/campaigns/route'

const app = express()

// ── Security & Parsing ────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Static uploads (dev only) ─────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// ── Webhooks (No tenant resolution needed as API key implies tenant) ──
app.use('/api/v1/webhooks', webhookRoutes)

// ── Tenant resolution ─────────────────────────────────────────────
app.use('/api/v1', tenantMiddleware)

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/v1/auth',           authRoutes)
app.use('/api/v1/students',       studentRoutes)
app.use('/api/v1/officers',       officerRoutes)
app.use('/api/v1/stages',         stageRoutes)
app.use('/api/v1/campaigns',      campaignRoutes)
app.use('/api/v1/document-types', documentTypeRoutes)
app.use('/api/v1/documents',      documentRoutes)
app.use('/api/v1/clearance',      clearanceRoutes)
app.use('/api/v1/notifications',  notificationRoutes)
app.use('/api/v1/sessions',       sessionRoutes)
app.use('/api/v1/branding',       brandingRoutes)
app.use('/api/v1/universities',   universityRoutes)
app.use('/api/v1/audit',          auditRoutes)
app.use('/api/v1/reports',        reportRoutes)
app.use('/api/v1/structure',      structureRoutes)

// ── Swagger docs ─────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec))

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ── 404 ───────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }))

// ── Global error handler ──────────────────────────────────────────
app.use(errorHandler)

export default app
