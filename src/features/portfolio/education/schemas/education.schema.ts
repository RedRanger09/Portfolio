import { z } from 'zod'

/** See `project.schema.ts`'s header note on why update schemas are written explicitly rather than via `.partial()`. */

const educationTypeSchema = z.enum(['school', 'college'])

export const createEducationSchema = z.object({
  type: educationTypeSchema,
  institution: z.string().min(1, 'Institution is required.'),
  shortName: z.string().optional(),
  degree: z.string().min(1, 'Degree is required.'),
  period: z.string().min(1, 'Period is required.'),
  location: z.string().min(1, 'Location is required.'),
  description: z.string().min(1, 'Description is required.'),
  highlights: z.array(z.string().min(1)).default([]),
  expectedGraduation: z.string().optional(),
  currentSemester: z.string().optional(),
  /** Display order. Omit to append at the end. */
  order: z.number().int().min(0).optional(),
})

export const updateEducationSchema = z.object({
  id: z.string().min(1, 'id is required.'),
  type: educationTypeSchema.optional(),
  institution: z.string().min(1, 'Institution is required.').optional(),
  shortName: z.string().optional(),
  degree: z.string().min(1, 'Degree is required.').optional(),
  period: z.string().min(1, 'Period is required.').optional(),
  location: z.string().min(1, 'Location is required.').optional(),
  description: z.string().min(1, 'Description is required.').optional(),
  highlights: z.array(z.string().min(1)).optional(),
  expectedGraduation: z.string().optional(),
  currentSemester: z.string().optional(),
  isVisible: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

export const deleteEducationSchema = z.object({
  id: z.string().min(1, 'id is required.'),
})

export type CreateEducationInput = z.infer<typeof createEducationSchema>
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>
export type DeleteEducationInput = z.infer<typeof deleteEducationSchema>
