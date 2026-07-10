import { z } from 'zod'
import { isYouTubeUrl } from '../lib/youtube'

/**
 * `updateProjectSchema` is written as its own explicit object, not
 * `createProjectSchema.partial()` — Zod's `.default()` still fires when a
 * `.partial()`-wrapped field is omitted, which would silently reset fields
 * on partial updates. Every update field is `.optional()` with no `.default()`.
 */

/** Empty string or a valid absolute URL — portfolio links are optional. */
const optionalUrlSchema = z.union([z.literal(''), z.string().url('Must be a valid URL.')])

/** Empty string or a recognizable YouTube watch/share/embed URL. */
const optionalYouTubeUrlSchema = z.union([
  z.literal(''),
  z
    .string()
    .url('Must be a valid URL.')
    .refine((value) => isYouTubeUrl(value), 'Must be a valid YouTube URL (youtube.com or youtu.be).'),
])

/** Local or remote image path — Cloudinary URLs slot in here unchanged. */
const imagePathSchema = z.string().min(1, 'Image path is required.').max(500)

const projectMetricSchema = z.object({
  label: z.string().min(1).max(80),
  value: z.string().min(1).max(120),
})

const projectGalleryItemSchema = z.object({
  src: z.string().min(1).max(500),
  caption: z.string().min(1).max(200),
  altText: z.string().max(200).optional(),
})

const projectDemoSchema = z.object({
  label: z.string().min(1).max(80),
  href: optionalYouTubeUrlSchema,
})

const slugSchema = z
  .string()
  .min(1, 'Slug is required.')
  .max(120, 'Slug must be at most 120 characters.')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase, alphanumeric, and hyphen-separated.')

const sectionTitleSchema = z.string().min(1).max(80)

export const createProjectSchema = z.object({
  slug: slugSchema,
  featured: z.boolean().default(false),
  isPlaceholder: z.boolean().default(false),
  name: z.string().min(1, 'Name is required.').max(120, 'Name must be at most 120 characters.'),
  category: z.string().min(1, 'Category is required.').max(80, 'Category must be at most 80 characters.'),
  heroEyebrow: z.string().max(80).optional(),
  tagline: z.string().min(1, 'Tagline is required.').max(200, 'Tagline must be at most 200 characters.'),
  description: z.string().min(1, 'Description is required.').max(2000, 'Description must be at most 2000 characters.'),
  techStack: z.array(z.string().min(1).max(80)).max(40).default([]),
  github: optionalUrlSchema.optional(),
  liveDemo: optionalUrlSchema.optional(),
  demo: projectDemoSchema.optional(),
  screenshot: imagePathSchema,
  screenshotMediaId: z.string().min(1).nullable().optional(),
  architectureImage: z.union([z.literal(''), imagePathSchema]).optional(),
  ragPipelineImage: z.union([z.literal(''), imagePathSchema]).optional(),
  metrics: z.array(projectMetricSchema).max(12).default([]),
  overview: z.string().max(5000).default(''),
  problem: z.string().max(5000).default(''),
  architecture: z.array(z.string().min(1).max(500)).max(40).default([]),
  implementation: z.array(z.string().min(1).max(500)).max(40).default([]),
  challenges: z.array(z.string().min(1).max(500)).max(40).default([]),
  lessonsLearned: z.array(z.string().min(1).max(500)).max(40).default([]),
  futureImprovements: z.array(z.string().min(1).max(500)).max(40).default([]),
  gallery: z.array(projectGalleryItemSchema).default([]),
  overviewTitle: sectionTitleSchema.optional(),
  problemTitle: sectionTitleSchema.optional(),
  techStackTitle: sectionTitleSchema.optional(),
  architectureTitle: sectionTitleSchema.optional(),
  implementationTitle: sectionTitleSchema.optional(),
  challengesTitle: sectionTitleSchema.optional(),
  lessonsLearnedTitle: sectionTitleSchema.optional(),
  futureImprovementsTitle: sectionTitleSchema.optional(),
  galleryTitle: sectionTitleSchema.optional(),
  videoTitle: sectionTitleSchema.optional(),
  liveDemoTitle: sectionTitleSchema.optional(),
  showOverview: z.boolean().default(true),
  showProblem: z.boolean().default(true),
  showTechStack: z.boolean().default(true),
  showArchitecture: z.boolean().default(true),
  showImplementation: z.boolean().default(true),
  showChallenges: z.boolean().default(true),
  showLessonsLearned: z.boolean().default(true),
  showFutureImprovements: z.boolean().default(true),
  showGallery: z.boolean().default(true),
  showVideo: z.boolean().default(true),
  showLiveDemo: z.boolean().default(true),
  showMetrics: z.boolean().default(true),
  showArchitectureImage: z.boolean().default(true),
  showRagPipelineImage: z.boolean().default(true),
  /** Display order in the Projects grid. Omit to append at the end (`create-project.ts`). */
  order: z.number().int().min(0).optional(),
})

export const updateProjectSchema = z.object({
  id: z.string().min(1, 'id is required.'),
  slug: slugSchema.optional(),
  featured: z.boolean().optional(),
  isPlaceholder: z.boolean().optional(),
  name: z.string().min(1, 'Name is required.').max(120).optional(),
  category: z.string().min(1, 'Category is required.').max(80).optional(),
  heroEyebrow: z.string().max(80).optional(),
  tagline: z.string().min(1, 'Tagline is required.').max(200).optional(),
  description: z.string().min(1, 'Description is required.').max(2000).optional(),
  techStack: z.array(z.string().min(1).max(80)).max(40).optional(),
  github: optionalUrlSchema.optional(),
  liveDemo: optionalUrlSchema.optional(),
  demo: projectDemoSchema.nullable().optional(),
  screenshot: imagePathSchema.optional(),
  screenshotMediaId: z.string().min(1).nullable().optional(),
  architectureImage: z.union([z.literal(''), imagePathSchema]).optional(),
  ragPipelineImage: z.union([z.literal(''), imagePathSchema]).optional(),
  metrics: z.array(projectMetricSchema).max(12).optional(),
  overview: z.string().max(5000).optional(),
  problem: z.string().max(5000).optional(),
  architecture: z.array(z.string().min(1).max(500)).max(40).optional(),
  implementation: z.array(z.string().min(1).max(500)).max(40).optional(),
  challenges: z.array(z.string().min(1).max(500)).max(40).optional(),
  lessonsLearned: z.array(z.string().min(1).max(500)).max(40).optional(),
  futureImprovements: z.array(z.string().min(1).max(500)).max(40).optional(),
  gallery: z.array(projectGalleryItemSchema).optional(),
  overviewTitle: sectionTitleSchema.optional(),
  problemTitle: sectionTitleSchema.optional(),
  techStackTitle: sectionTitleSchema.optional(),
  architectureTitle: sectionTitleSchema.optional(),
  implementationTitle: sectionTitleSchema.optional(),
  challengesTitle: sectionTitleSchema.optional(),
  lessonsLearnedTitle: sectionTitleSchema.optional(),
  futureImprovementsTitle: sectionTitleSchema.optional(),
  galleryTitle: sectionTitleSchema.optional(),
  videoTitle: sectionTitleSchema.optional(),
  liveDemoTitle: sectionTitleSchema.optional(),
  showOverview: z.boolean().optional(),
  showProblem: z.boolean().optional(),
  showTechStack: z.boolean().optional(),
  showArchitecture: z.boolean().optional(),
  showImplementation: z.boolean().optional(),
  showChallenges: z.boolean().optional(),
  showLessonsLearned: z.boolean().optional(),
  showFutureImprovements: z.boolean().optional(),
  showGallery: z.boolean().optional(),
  showVideo: z.boolean().optional(),
  showLiveDemo: z.boolean().optional(),
  showMetrics: z.boolean().optional(),
  showArchitectureImage: z.boolean().optional(),
  showRagPipelineImage: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

export const deleteProjectSchema = z.object({
  id: z.string().min(1, 'id is required.'),
})

export const duplicateProjectSchema = z.object({
  id: z.string().min(1, 'id is required.'),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>
export type DuplicateProjectInput = z.infer<typeof duplicateProjectSchema>
