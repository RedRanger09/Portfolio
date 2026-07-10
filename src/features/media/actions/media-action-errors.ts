import { MutationNotFoundError, MutationValidationError, mutationFailure, type MutationResult } from '@/lib/mutation-result'

export function handleMediaActionError(error: unknown, label: string): MutationResult<never> {
  if (error instanceof MutationValidationError) {
    return mutationFailure({
      type: 'VALIDATION',
      message: error.message,
      fieldErrors: error.fieldErrors,
    })
  }

  if (error instanceof MutationNotFoundError) {
    return mutationFailure({ type: 'NOT_FOUND', message: error.message })
  }

  console.error(`[media:${label}] Unexpected error:`, error)
  return mutationFailure({ type: 'UNEXPECTED', message: 'Something went wrong. Please try again.' })
}
