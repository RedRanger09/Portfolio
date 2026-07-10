'use server'

import type { SkillIcon as PrismaSkillIcon } from '@prisma/client'
import { assertAdminAccess } from '@/lib/auth-placeholder'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { mapAccentColorToDb } from '@/lib/prisma-enum-mappers'
import { resolveTechnologyIds } from '@/lib/technology-resolver'
import { SKILL_CATEGORY_INCLUDE, type SkillCategoryRow } from '../data'
import type { SkillGroupIcon } from '../types'
import { updateSkillCategorySchema } from '../schemas/skill-category.schema'

/** Inverse of `SKILL_ICON_MAP` in `skills/data.ts` — only this action writes `SkillCategory.icon`. */
const SKILL_ICON_TO_DB: Record<SkillGroupIcon, PrismaSkillIcon> = {
  Code2: 'CODE2',
  Brain: 'BRAIN',
  Layout: 'LAYOUT',
  Wrench: 'WRENCH',
  Cloud: 'CLOUD',
}

/**
 * Partially updates an existing `SkillCategory`. `items`, when provided,
 * replaces the entire ordered set of `Skill` join rows — same
 * delete-then-recreate approach as `update-project.ts`'s `techStack`.
 */
export async function updateSkillCategory(input: unknown): Promise<MutationResult<SkillCategoryRow>> {
  // TODO(auth, Phase 6): only an authenticated admin may reach this point.
  await assertAdminAccess()

  return runMutation(
    updateSkillCategorySchema,
    input,
    async (data) => {
      const { id, icon, accent, items, ...rest } = data

      const skillCategory = await prisma.$transaction(async (tx) => {
        const existing = await tx.skillCategory.findUnique({ where: { id }, select: { id: true } })
        if (!existing) {
          throw new MutationNotFoundError(`SkillCategory "${id}" does not exist.`)
        }

        await tx.skillCategory.update({
          where: { id },
          data: {
            ...rest,
            ...(icon !== undefined && { icon: SKILL_ICON_TO_DB[icon] }),
            ...(accent !== undefined && { accent: mapAccentColorToDb(accent) }),
          },
        })

        if (items !== undefined) {
          await tx.skill.deleteMany({ where: { skillCategoryId: id } })
          if (items.length > 0) {
            const technologyIds = await resolveTechnologyIds(tx, items)
            await tx.skill.createMany({
              data: technologyIds.map((technologyId, index) => ({ skillCategoryId: id, technologyId, order: index })),
            })
          }
        }

        // TODO(audit): once the audit system exists, this call starts writing real rows.
        await recordAuditEvent({ action: 'update', entity: 'SkillCategory', entityId: id })

        return tx.skillCategory.findUniqueOrThrow({ where: { id }, include: SKILL_CATEGORY_INCLUDE })
      })

      return skillCategory
    },
    'update-skill-category',
  )
}
