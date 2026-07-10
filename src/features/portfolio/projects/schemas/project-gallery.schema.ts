import { z } from 'zod'

export const addProjectGalleryImageMetadataSchema = z.object({
  projectId: z.string().min(1),
  caption: z.string().max(200).optional(),
  altText: z.string().max(200).optional(),
})

export const updateProjectGalleryItemSchema = z.object({
  projectId: z.string().min(1),
  attachmentId: z.string().min(1),
  caption: z.string().max(200).optional(),
  altText: z.string().max(200).nullable().optional(),
})

export const reorderProjectGallerySchema = z.object({
  projectId: z.string().min(1),
  attachmentIds: z.array(z.string().min(1)).min(1),
})

export const removeProjectGalleryItemSchema = z.object({
  projectId: z.string().min(1),
  attachmentId: z.string().min(1),
})

export const replaceProjectGalleryImageMetadataSchema = z.object({
  projectId: z.string().min(1),
  attachmentId: z.string().min(1),
  caption: z.string().max(200).optional(),
  altText: z.string().max(200).optional(),
})
