import { z } from 'zod'
import { accentColorSchema } from '@/shared/schemas'

/** See `project.schema.ts`'s header note on why update schemas are written explicitly rather than via `.partial()`. */

const skillGroupIconSchema = z.enum(['Code2', 'Brain', 'Layout', 'Wrench', 'Cloud'])

export const createSkillCategorySchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  icon: skillGroupIconSchema,
  accent: accentColorSchema,
  note: z.string().min(1, 'Note is required.'),
  /** Technology names, in display order. Resolved to `Technology`/`Skill` rows by `create-skill-category.ts`. */
  items: z.array(z.string().min(1)).default([]),
  /** Display order among skill groups. Omit to append at the end. */
  order: z.number().int().min(0).optional(),
})

export const updateSkillCategorySchema = z.object({
  id: z.string().min(1, 'id is required.'),
  title: z.string().min(1, 'Title is required.').optional(),
  icon: skillGroupIconSchema.optional(),
  accent: accentColorSchema.optional(),
  note: z.string().min(1, 'Note is required.').optional(),
  items: z.array(z.string().min(1)).optional(),
  order: z.number().int().min(0).optional(),
})

export const deleteSkillCategorySchema = z.object({
  id: z.string().min(1, 'id is required.'),
})

export type CreateSkillCategoryInput = z.infer<typeof createSkillCategorySchema>
export type UpdateSkillCategoryInput = z.infer<typeof updateSkillCategorySchema>
export type DeleteSkillCategoryInput = z.infer<typeof deleteSkillCategorySchema>
