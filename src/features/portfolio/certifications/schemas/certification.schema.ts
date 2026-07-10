import { z } from 'zod'

/** See `project.schema.ts`'s header note on why update schemas are written explicitly rather than via `.partial()`. */

export const createCertificationSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  provider: z.string().min(1, 'Provider is required.'),
  providerLogo: z.string().optional(),
  completionDate: z.string().optional(),
  credentialUrl: z.string().min(1, 'Credential URL is required.'),
  verifyUrl: z.string().min(1, 'Verify URL is required.'),
  image: z.string().min(1, 'Image is required.'),
  /** Display order. Omit to append at the end. */
  order: z.number().int().min(0).optional(),
})

export const updateCertificationSchema = z.object({
  id: z.string().min(1, 'id is required.'),
  name: z.string().min(1, 'Name is required.').optional(),
  provider: z.string().min(1, 'Provider is required.').optional(),
  providerLogo: z.string().optional(),
  completionDate: z.string().optional(),
  credentialUrl: z.string().min(1, 'Credential URL is required.').optional(),
  verifyUrl: z.string().min(1, 'Verify URL is required.').optional(),
  image: z.string().min(1, 'Image is required.').optional(),
  order: z.number().int().min(0).optional(),
})

export const deleteCertificationSchema = z.object({
  id: z.string().min(1, 'id is required.'),
})

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>
export type DeleteCertificationInput = z.infer<typeof deleteCertificationSchema>
