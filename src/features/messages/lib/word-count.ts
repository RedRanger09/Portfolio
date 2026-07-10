/** Shared word-count helpers for the public contact form (client + server). */

export const MAX_MESSAGE_WORDS = 100

/** Counts words after trim — empty strings contribute zero. */
export function countWords(value: string): number {
  const trimmed = value.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(Boolean).length
}
