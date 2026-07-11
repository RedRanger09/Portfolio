'use server'

import { assertAdminAccess, requireAuthenticatedSession } from '@/lib/auth'
import { mutationSuccess, type MutationResult } from '@/lib/mutation-result'
import { revalidatePublicContent } from '@/lib/revalidate-public'
import type { MediaAsset, MediaFolderKey } from '../types'
import { uploadMediaMetadataSchema } from '../schemas/media.schema'
import { readUploadFile, validateImageUpload } from '../lib/media-validation'
import { uploadMediaAsset } from '../lib/media-service'
import { handleMediaActionError } from './media-action-errors'
import { parseFormMetadata } from './parse-form-metadata'

/** Server-side image upload — validates, uploads to Cloudinary, persists `Media`. */
export async function uploadMedia(formData: FormData): Promise<MutationResult<MediaAsset>> {
  await assertAdminAccess()

  try {
    const metadata = parseFormMetadata(uploadMediaMetadataSchema, formData, {
      folder: 'folder',
      altText: 'altText',
    })

    const file = readUploadFile(formData)
    const buffer = Buffer.from(await file.arrayBuffer())
    const validated = validateImageUpload(file, buffer)
    const session = await requireAuthenticatedSession()

    const media = await uploadMediaAsset({
      file: validated,
      folderKey: metadata.folder as MediaFolderKey,
      altText: metadata.altText,
      uploadedByEmail: session.email,
    })

    revalidatePublicContent()
    return mutationSuccess(media)
  } catch (error) {
    return handleMediaActionError(error, 'upload-media')
  }
}
