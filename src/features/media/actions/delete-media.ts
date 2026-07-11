'use server'

import { assertAdminAccess } from '@/lib/auth'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { revalidatePublicContent } from '@/lib/revalidate-public'
import { deleteMediaSchema } from '../schemas/media.schema'
import { softDeleteMediaAsset } from '../lib/media-service'

/** Soft-deletes a media asset when it is not referenced by any content. */
export async function deleteMedia(input: unknown): Promise<MutationResult<{ id: string }>> {
  await assertAdminAccess()

  return runMutation(
    deleteMediaSchema,
    input,
    async ({ id }) => {
      const result = await softDeleteMediaAsset(id)
      revalidatePublicContent()
      return result
    },
    'delete-media',
  )
}
