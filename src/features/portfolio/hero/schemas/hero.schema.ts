import { z } from 'zod'
import { accentColorSchema } from '@/shared/schemas'

const heroInterestIconSchema = z.enum(['GraduationCap', 'Code2', 'Brain'])
const heroCtaVariantSchema = z.enum(['primary', 'secondary', 'ghost'])
const heroCtaIconSchema = z.enum(['FolderKanban', 'Download', 'GitBranch', 'BriefcaseBusiness'])

const interestCardSchema = z.object({
  icon: heroInterestIconSchema,
  label: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  items: z.array(z.string().min(1)).default([]),
  accent: accentColorSchema,
})

const heroCtaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  variant: heroCtaVariantSchema,
  icon: heroCtaIconSchema,
  download: z.boolean().optional(),
})

/**
 * `Hero` is a singleton (`prisma/schema.prisma`'s "exactly one row"
 * note) — there's no `createHeroSchema`/`deleteHeroSchema`, only an
 * update, which the action treats as an upsert (see `update-hero.ts`).
 */
export const updateHeroSchema = z.object({
  eyebrow: z.string().min(1, 'Eyebrow is required.'),
  title: z.string().min(1, 'Title is required.'),
  subtitle: z.string().min(1, 'Subtitle is required.'),
  description: z.string().min(1, 'Description is required.'),
  profileImage: z.string().min(1, 'Profile image is required.'),
  interestCards: z.array(interestCardSchema).min(1, 'At least one interest card is required.'),
  ctas: z.array(heroCtaSchema).min(1, 'At least one CTA is required.'),
})

export type UpdateHeroInput = z.infer<typeof updateHeroSchema>
