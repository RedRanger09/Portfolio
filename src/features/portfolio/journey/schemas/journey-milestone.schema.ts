import { z } from 'zod'
import { accentColorSchema } from '@/shared/schemas'

/** See `project.schema.ts`'s header note on why update schemas are written explicitly rather than via `.partial()`. */

const journeyIconSchema = z.enum([
  'GraduationCap',
  'Brain',
  'Workflow',
  'Building2',
  'Globe',
  'Zap',
  'Image',
  'Target',
  'Sparkles',
  'Award',
  'Code2',
  'TerminalSquare',
])

export const createJourneyMilestoneSchema = z.object({
  label: z.string().min(1, 'Label is required.'),
  year: z.string().min(1, 'Year is required.'),
  description: z.string().min(1, 'Description is required.'),
  icon: journeyIconSchema,
  accent: accentColorSchema,
  isCurrent: z.boolean().default(false),
  subItems: z.array(z.string().min(1)).default([]),
  /** Chronological display order. Omit to append at the end. */
  order: z.number().int().min(0).optional(),
})

export const updateJourneyMilestoneSchema = z.object({
  id: z.string().min(1, 'id is required.'),
  label: z.string().min(1, 'Label is required.').optional(),
  year: z.string().min(1, 'Year is required.').optional(),
  description: z.string().min(1, 'Description is required.').optional(),
  icon: journeyIconSchema.optional(),
  accent: accentColorSchema.optional(),
  isCurrent: z.boolean().optional(),
  subItems: z.array(z.string().min(1)).optional(),
  isVisible: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

export const deleteJourneyMilestoneSchema = z.object({
  id: z.string().min(1, 'id is required.'),
})

export type CreateJourneyMilestoneInput = z.infer<typeof createJourneyMilestoneSchema>
export type UpdateJourneyMilestoneInput = z.infer<typeof updateJourneyMilestoneSchema>
export type DeleteJourneyMilestoneInput = z.infer<typeof deleteJourneyMilestoneSchema>
