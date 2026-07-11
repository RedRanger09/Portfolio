import { z } from 'zod'

/** `Resume` is a singleton — see `hero.schema.ts`'s note on why there's only an update, no create/delete. */
export const updateResumeSchema = z.object({
  label: z.string().min(1, 'Label is required.'),
  title: z.string().min(1, 'Title is required.'),
  filePath: z.string().min(1, 'File path is required.'),
  previewImage: z.string().min(1, 'Preview image is required.'),
  previewAlt: z.string().min(1, 'Preview alt text is required.'),
  previewImageWidth: z.number().int().positive('Width must be a positive number.'),
  previewImageHeight: z.number().int().positive('Height must be a positive number.'),
  isVisible: z.boolean().default(true),
})

export type UpdateResumeInput = z.infer<typeof updateResumeSchema>
