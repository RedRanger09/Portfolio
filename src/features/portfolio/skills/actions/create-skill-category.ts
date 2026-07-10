'use server'

import type { SkillIcon as PrismaSkillIcon } from '@prisma/client'
import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { mapAccentColorToDb } from '@/lib/prisma-enum-mappers'
import { resolveTechnologyIds } from '@/lib/technology-resolver'
import { SKILL_CATEGORY_INCLUDE, type SkillCategoryRow } from '../data'
import type { SkillGroupIcon } from '../types'
import { createSkillCategorySchema } from '../schemas/skill-category.schema'

/** Inverse of `SKILL_ICON_MAP` in `skills/data.ts` — only this action writes `SkillCategory.icon`. */
const SKILL_ICON_TO_DB: Record<SkillGroupIcon, PrismaSkillIcon> = {
  Code2: 'CODE2',
  Brain: 'BRAIN',
  Layout: 'LAYOUT',
  Wrench: 'WRENCH',
  Cloud: 'CLOUD',
}

/**
 * Creates a new `SkillCategory`, resolving `items` (technology names) to
 * `Technology` rows and writing the ordered `Skill` join rows — same
 * "project + join rows" transaction shape as `create-project.ts`.
 */
export async function createSkillCategory(input: unknown): Promise<MutationResult<SkillCategoryRow>> {
  await assertAdminAccess()

  return runMutation(
    createSkillCategorySchema,
    input,
    async (data) => {
      const skillCategory = await prisma.$transaction(async (tx) => {
        const order = data.order ?? (await tx.skillCategory.count())

        const created = await tx.skillCategory.create({
          data: {
            title: data.title,
            icon: SKILL_ICON_TO_DB[data.icon],
            accent: mapAccentColorToDb(data.accent),
            note: data.note,
            order,
          },
        })

        if (data.items.length > 0) {
          const technologyIds = await resolveTechnologyIds(tx, data.items)
          await tx.skill.createMany({
            data: technologyIds.map((technologyId, index) => ({
              skillCategoryId: created.id,
              technologyId,
              order: index,
            })),
          })
        }

        // TODO(audit): once the audit system exists, this call starts writing real rows.
        await recordAuditEvent({ action: 'create', entity: 'SkillCategory', entityId: created.id })

        return tx.skillCategory.findUniqueOrThrow({ where: { id: created.id }, include: SKILL_CATEGORY_INCLUDE })
      })

      return skillCategory
    },
    'create-skill-category',
  )
}
