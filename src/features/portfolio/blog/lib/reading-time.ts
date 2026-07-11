/** Rough reading-time estimate — ~200 words per minute. */
export function estimateReadingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function getBlogCategory(tags: string[]): string | null {
  return tags[0] ?? null
}
