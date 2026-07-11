import { z } from 'zod'

const imagePathSchema = z.string().min(1).max(500)

const visibilityFlagsSchema = z.object({
  showHero: z.boolean(),
  showAbout: z.boolean(),
  showJourney: z.boolean(),
  showSkills: z.boolean(),
  showProjects: z.boolean(),
  showEducation: z.boolean(),
  showCertificates: z.boolean(),
  showResume: z.boolean(),
  showBlog: z.boolean(),
  showContact: z.boolean(),
  showContactForm: z.boolean(),
  showInterests: z.boolean(),
})

export const updateSiteSettingsSchema = z.object({
  siteTitle: z.string().min(1).max(160),
  siteDescription: z.string().min(1).max(500),
  keywords: z.array(z.string().min(1).max(40)).default([]),
  ogImage: imagePathSchema,
  ogImageMediaId: z.string().min(1).nullable().optional(),
  favicon: imagePathSchema,
  github: z.string().url(),
  linkedin: z.string().url(),
  githubDisplay: z.string().min(1).max(120),
  linkedinDisplay: z.string().min(1).max(120),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().max(500).nullable().optional(),
}).merge(visibilityFlagsSchema)
