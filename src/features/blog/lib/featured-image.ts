import { MutationValidationError } from '@/lib/mutation-result'
import { resolveMediaUrlById } from '@/features/media/lib/media-service'

interface FeaturedImageWriteInput {
  featuredImage?: string
  featuredImageMediaId?: string | null
}

export async function resolveBlogFeaturedImageWrite(input: FeaturedImageWriteInput): Promise<{
  featuredImage?: string
  featuredImageMediaId?: string | null
}> {
  if (input.featuredImageMediaId === undefined) {
    return { featuredImage: input.featuredImage }
  }

  if (input.featuredImageMediaId === null) {
    if (!input.featuredImage) {
      throw new MutationValidationError({ featuredImage: ['A featured image is required.'] })
    }

    return { featuredImage: input.featuredImage, featuredImageMediaId: null }
  }

  const url = await resolveMediaUrlById(input.featuredImageMediaId)

  if (!url) {
    throw new MutationValidationError({ featuredImageMediaId: ['Selected media no longer exists.'] })
  }

  return {
    featuredImage: url,
    featuredImageMediaId: input.featuredImageMediaId,
  }
}
