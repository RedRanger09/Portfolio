'use server'

import { assertAdminAccess, requireAuthenticatedSession } from '@/lib/auth'
import { mutationSuccess, type MutationResult } from '@/lib/mutation-result'
import { revalidatePublicContent } from '@/lib/revalidate-public'
import type { MediaAsset, MediaFolderKey } from '../types'
import { replaceMediaMetadataSchema } from '../schemas/media.schema'
import { readUploadFile, validateImageUpload } from '../lib/media-validation'
import { replaceMediaAsset } from '../lib/media-service'
import { handleMediaActionError } from './media-action-errors'
import { parseFormMetadata } from './parse-form-metadata'

/** Replaces an existing media asset with a newly uploaded file. */
export async function replaceMedia(formData: FormData): Promise<MutationResult<MediaAsset>> {
  await assertAdminAccess()

  try {
    const metadata = parseFormMetadata(replaceMediaMetadataSchema, formData, {
      mediaId: 'mediaId',
      folder: 'folder',
      altText: 'altText',
    })

    const file = readUploadFile(formData)
    const buffer = Buffer.from(await file.arrayBuffer())
    const validated = validateImageUpload(file, buffer)
    const session = await requireAuthenticatedSession()

    const media = await replaceMediaAsset({
      mediaId: metadata.mediaId,
      file: validated,
      folderKey: metadata.folder as MediaFolderKey,
      altText: metadata.altText,
      uploadedByEmail: session.email,
    })

    revalidatePublicContent()
    return mutationSuccess(media)
  } catch (error) {
    return handleMediaActionError(error, 'replace-media')
  }
}
