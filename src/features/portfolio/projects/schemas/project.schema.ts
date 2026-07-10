import { z } from 'zod'

/**
 * `updateProjectSchema` is written as its own explicit object, not
 * `createProjectSchema.partial()` — Zod's `.default()` still fires when a
 * `.partial()`-wrapped field is omitted (verified directly: parsing `{}`
 * through `z.object({ featured: z.boolean().default(false) }).partial()`
 * still yields `{ featured: false }`), which would silently reset a field
 * like `featured`/`techStack` to its create-time default on every partial
 * update that doesn't happen to mention it. Every field below is
 * `.optional()` with no `.default()`, so an omitted field is left alone
 * by `update-project.ts`, not overwritten.
 */

const projectMetricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

const projectGalleryItemSchema = z.object({
  src: z.string().min(1),
  caption: z.string().min(1),
})

const projectDemoSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
})

const slugSchema = z
  .string()
  .min(1, 'Slug is required.')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase, alphanumeric, and hyphen-separated.')

export const createProjectSchema = z.object({
  slug: slugSchema,
  featured: z.boolean().default(false),
  isPlaceholder: z.boolean().default(false),
  name: z.string().min(1, 'Name is required.'),
  category: z.string().min(1, 'Category is required.'),
  tagline: z.string().min(1, 'Tagline is required.'),
  description: z.string().min(1, 'Description is required.'),
  techStack: z.array(z.string().min(1)).default([]),
  github: z.string().optional(),
  liveDemo: z.string().optional(),
  demo: projectDemoSchema.optional(),
  screenshot: z.string().min(1, 'Screenshot is required.'),
  architectureImage: z.string().optional(),
  ragPipelineImage: z.string().optional(),
  metrics: z.array(projectMetricSchema).default([]),
  overview: z.string().default(''),
  problem: z.string().default(''),
  architecture: z.array(z.string().min(1)).default([]),
  implementation: z.array(z.string().min(1)).default([]),
  challenges: z.array(z.string().min(1)).default([]),
  lessonsLearned: z.array(z.string().min(1)).default([]),
  futureImprovements: z.array(z.string().min(1)).default([]),
  gallery: z.array(projectGalleryItemSchema).default([]),
  /** Display order in the Projects grid. Omit to append at the end (`create-project.ts`). */
  order: z.number().int().min(0).optional(),
})

export const updateProjectSchema = z.object({
  id: z.string().min(1, 'id is required.'),
  slug: slugSchema.optional(),
  featured: z.boolean().optional(),
  isPlaceholder: z.boolean().optional(),
  name: z.string().min(1, 'Name is required.').optional(),
  category: z.string().min(1, 'Category is required.').optional(),
  tagline: z.string().min(1, 'Tagline is required.').optional(),
  description: z.string().min(1, 'Description is required.').optional(),
  techStack: z.array(z.string().min(1)).optional(),
  github: z.string().optional(),
  liveDemo: z.string().optional(),
  demo: projectDemoSchema.nullable().optional(),
  screenshot: z.string().min(1, 'Screenshot is required.').optional(),
  architectureImage: z.string().optional(),
  ragPipelineImage: z.string().optional(),
  metrics: z.array(projectMetricSchema).optional(),
  overview: z.string().optional(),
  problem: z.string().optional(),
  architecture: z.array(z.string().min(1)).optional(),
  implementation: z.array(z.string().min(1)).optional(),
  challenges: z.array(z.string().min(1)).optional(),
  lessonsLearned: z.array(z.string().min(1)).optional(),
  futureImprovements: z.array(z.string().min(1)).optional(),
  gallery: z.array(projectGalleryItemSchema).optional(),
  order: z.number().int().min(0).optional(),
})

export const deleteProjectSchema = z.object({
  id: z.string().min(1, 'id is required.'),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>
