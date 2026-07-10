import { MutationValidationError } from '@/lib/mutation-result'
import { resolveMediaUrlById } from '@/features/media/lib/media-service'

interface ScreenshotWriteInput {
  screenshot?: string
  screenshotMediaId?: string | null
}

/** Resolves denormalized screenshot URL + media FK for project writes. */
export async function resolveProjectScreenshotWrite(input: ScreenshotWriteInput): Promise<{
  screenshot?: string
  screenshotMediaId?: string | null
}> {
  if (input.screenshotMediaId === undefined) {
    return { screenshot: input.screenshot }
  }

  if (input.screenshotMediaId === null) {
    if (!input.screenshot) {
      throw new MutationValidationError({ screenshot: ['A thumbnail image is required.'] })
    }

    return { screenshot: input.screenshot, screenshotMediaId: null }
  }

  const url = await resolveMediaUrlById(input.screenshotMediaId)

  if (!url) {
    throw new MutationValidationError({ screenshotMediaId: ['Selected media no longer exists.'] })
  }

  return {
    screenshot: url,
    screenshotMediaId: input.screenshotMediaId,
  }
}
