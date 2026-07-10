import type { MutationResult } from '@/lib/mutation-result'

/** Maps a validation `MutationResult` to per-field error strings for admin forms. */
export function applyFieldErrors(result: MutationResult<unknown>, setErrors: (errors: Record<string, string>) => void): boolean {
  if (!result.success && result.error.type === 'VALIDATION') {
    const next: Record<string, string> = {}
    for (const [key, messages] of Object.entries(result.error.fieldErrors)) {
      if (messages[0]) next[key] = messages[0]
    }
    setErrors(next)
    return true
  }
  return false
}
