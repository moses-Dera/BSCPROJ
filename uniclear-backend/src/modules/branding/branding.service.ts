import { db } from '@/lib/db'
import { NotFoundError, TierLimitError } from '@/core/errors/AppError'
import { TIER_LIMITS } from '@/lib/constants/tiers'
import { storage } from '@/modules/documents/storage'

export class BrandingService {
  static async get(universityId: string) {
    const [branding, university] = await Promise.all([
      db.universityBranding.findUnique({ where: { universityId } }),
      db.university.findUnique({ where: { id: universityId }, select: { primaryColor: true, accentColor: true } }),
    ])
    return { ...branding, primaryColor: university?.primaryColor, accentColor: university?.accentColor }
  }

  static async update(universityId: string, data: { primaryColor?: string; accentColor?: string; bannerMessage?: string; footerText?: string }) {
    const contract = await db.contractPlan.findUnique({ where: { universityId } })
    const tier = contract?.tier ?? 'TRIAL'
    if (!TIER_LIMITS[tier].customBranding) throw new TierLimitError('Custom branding not available on your plan')

    const { primaryColor, accentColor, ...brandingData } = data

    if (primaryColor || accentColor) {
      await db.university.update({ where: { id: universityId }, data: { primaryColor, accentColor } })
    }

    return db.universityBranding.upsert({
      where: { universityId },
      create: { universityId, ...brandingData },
      update: brandingData,
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

  static async uploadCertificateTemplate(universityId: string, file: Express.Multer.File) {
    const contract = await db.contractPlan.findUnique({ where: { universityId } })
    const tier = contract?.tier ?? 'TRIAL'
    if (!TIER_LIMITS[tier].customBranding) throw new TierLimitError('Custom branding not available on your plan')

    const { url, key } = await storage.upload(file.buffer, `branding/${universityId}/cert-template-${Date.now()}`, file.mimetype)
    await db.universityBranding.upsert({
      where: { universityId },
      create: { universityId, certificateTemplateUrl: url, certificateTemplateKey: key },
      update: { certificateTemplateUrl: url, certificateTemplateKey: key },
    })
    return { certificateTemplateUrl: url }
  }
}
