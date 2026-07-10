'use server'

import { assertAdminAccess } from '@/lib/auth'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import type { MediaAsset } from '../types'
import { updateMediaMetadataSchema } from '../schemas/media.schema'
import { updateMediaMetadata } from '../lib/media-service'

export async function updateMediaMetadataAction(input: unknown): Promise<MutationResult<MediaAsset>> {
  await assertAdminAccess()

  return runMutation(updateMediaMetadataSchema, input, async ({ id, altText }) => updateMediaMetadata(id, altText), 'update-media-metadata')
}
