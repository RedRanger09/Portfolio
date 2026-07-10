import { z } from 'zod'

/** `About` is a singleton — see `hero.schema.ts`'s note on why there's only an update, no create/delete. */
export const updateAboutSchema = z.object({
  label: z.string().min(1, 'Label is required.'),
  title: z.string().min(1, 'Title is required.'),
  subtitle: z.string().min(1, 'Subtitle is required.'),
  story: z.array(z.string().min(1)).min(1, 'At least one story paragraph is required.'),
  currentlyLearning: z.object({
    title: z.string().min(1),
    items: z.array(z.string().min(1)).min(1),
  }),
  interestsLabel: z.string().min(1, 'Interests label is required.'),
  interests: z.array(z.string().min(1)).min(1, 'At least one interest is required.'),
})

export type UpdateAboutInput = z.infer<typeof updateAboutSchema>
