import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export class CampaignsRepository {
  static async findAll(universityId: string) {
    return db.clearanceCampaign.findMany({
      where: { universityId },
      orderBy: { createdAt: 'desc' },
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' },
          include: {
            officerAssignments: { include: { officer: { include: { user: true } } } },
            documentRequirements: { include: { documentType: true } }
          }
        }
      }
    })
  }

  static async findActive(universityId: string, filter?: { facultyId?: string, departmentId?: string, level?: string, identifiers?: string[] }) {
    const baseWhere: Prisma.ClearanceCampaignWhereInput = { universityId, isActive: true }

    if (filter) {
      // The campaign targets are satisfied if they are null, OR if they match the student's properties.
      // Additionally, if whitelistEnabled is true, the student's email must be in the whitelist.
      const OR: Prisma.ClearanceCampaignWhereInput[] = [
        { targetFacultyId: null },
        { targetFacultyId: filter.facultyId }
      ]

      const deptOR: Prisma.ClearanceCampaignWhereInput[] = [
        { targetDepartmentId: null },
        { targetDepartmentId: filter.departmentId }
      ]

      const levelOR: Prisma.ClearanceCampaignWhereInput[] = [
        { targetLevel: null },
        { targetLevel: filter.level }
      ]

      baseWhere.AND = [
        { OR },
        { OR: deptOR },
        { OR: levelOR },
        {
          OR: [
            { whitelistEnabled: false },
            { whitelistEnabled: true, whitelist: { hasSome: filter.identifiers || [] } }
          ]
        }
      ]
    }

    return db.clearanceCampaign.findMany({
      where: baseWhere,
      orderBy: { createdAt: 'desc' }
    })
  }

  static async findById(id: string, universityId: string) {
    return db.clearanceCampaign.findFirst({
      where: { id, universityId },
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' },
          include: {
            officerAssignments: { include: { officer: { include: { user: true } } } },
            documentRequirements: { include: { documentType: true } }
          }
        }
      }
    })
  }

  static async create(data: Prisma.ClearanceCampaignUncheckedCreateInput) {
    return db.clearanceCampaign.create({ data })
  }

  static async update(id: string, data: Prisma.ClearanceCampaignUncheckedUpdateInput) {
    return db.clearanceCampaign.update({ where: { id }, data })
  }

  static async delete(id: string) {
    return db.clearanceCampaign.delete({ where: { id } })
  }

  static async toggle(id: string, isActive: boolean) {
    return db.clearanceCampaign.update({ where: { id }, data: { isActive } })
  }
}
