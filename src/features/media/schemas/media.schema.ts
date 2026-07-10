import { z } from 'zod'

export const MEDIA_FOLDER_KEYS = [
  'projects',
  'certificates',
  'blog',
  'resume',
  'avatars',
  'hero',
  'about',
] as const

export const mediaFolderSchema = z.enum(MEDIA_FOLDER_KEYS)

export const uploadMediaMetadataSchema = z.object({
  folder: mediaFolderSchema,
  altText: z.string().max(200, 'Alt text must be at most 200 characters.').optional(),
})

export const replaceMediaMetadataSchema = uploadMediaMetadataSchema.extend({
  mediaId: z.string().min(1, 'mediaId is required.'),
})

export const deleteMediaSchema = z.object({
  id: z.string().min(1, 'id is required.'),
})

export const updateMediaMetadataSchema = z.object({
  id: z.string().min(1, 'id is required.'),
  altText: z.string().max(200, 'Alt text must be at most 200 characters.').nullable(),
})

export type UploadMediaMetadata = z.infer<typeof uploadMediaMetadataSchema>
export type ReplaceMediaMetadata = z.infer<typeof replaceMediaMetadataSchema>
export type DeleteMediaInput = z.infer<typeof deleteMediaSchema>
