import { db } from '@/lib/db'
import { NotFoundError, TierLimitError } from '@/core/errors/AppError'
import { TIER_LIMITS } from '@/lib/constants/tiers'
import { storage } from '@/modules/documents/storage'

export class BrandingService {
  static async get(universityId: string) {
    return db.universityBranding.findUnique({ where: { universityId } })
  }

  static async update(universityId: string, data: { bannerMessage?: string; footerText?: string }) {
    const contract = await db.contractPlan.findUnique({ where: { universityId } })
    const tier = contract?.tier ?? 'TRIAL'
    if (!TIER_LIMITS[tier].customBranding) throw new TierLimitError('Custom branding not available on your plan')

    return db.universityBranding.upsert({
      where: { universityId },
      create: { universityId, ...data },
      update: data,
    })
  }

  static async uploadLogo(universityId: string, file: Express.Multer.File) {
    const contract = await db.contractPlan.findUnique({ where: { universityId } })
    const tier = contract?.tier ?? 'TRIAL'
    if (!TIER_LIMITS[tier].customBranding) throw new TierLimitError('Custom branding not available on your plan')

    const { url } = await storage.upload(file.buffer, `branding/${universityId}/logo-${Date.now()}`, file.mimetype)
    await db.university.update({ where: { id: universityId }, data: { logoUrl: url } })
    return { logoUrl: url }
  }

  static async uploadLoginBg(universityId: string, file: Express.Multer.File) {
    const contract = await db.contractPlan.findUnique({ where: { universityId } })
    const tier = contract?.tier ?? 'TRIAL'
    if (!TIER_LIMITS[tier].customBranding) throw new TierLimitError('Custom branding not available on your plan')

    const { url } = await storage.upload(file.buffer, `branding/${universityId}/login-bg-${Date.now()}`, file.mimetype)
    await db.universityBranding.upsert({
      where: { universityId },
      create: { universityId, loginBgUrl: url },
      update: { loginBgUrl: url },
    })
    return { loginBgUrl: url }
  }
}
