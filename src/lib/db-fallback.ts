/**
 * Shared "read from the database, fall back to static content on failure"
 * wrapper — used by every migrated feature's `data.ts`.
 *
 * Empty arrays are valid results (e.g. every collection item is soft-hidden
 * via `isVisible`). Only `null`/`undefined` or a thrown error should trigger
 * the static seed fallback — otherwise hiding the last visible item would
 * resurrect the full fallback list on the public site.
 */

export async function withDbFallback<T>(queryFn: () => Promise<T | null>, fallback: T, label: string): Promise<T> {
  try {
    const result = await queryFn()

    if (result === null || result === undefined) {
      console.error(`[db:${label}] Query returned no data — serving static fallback content.`)
      return fallback
    }

    return result
  } catch (error) {
    console.error(`[db:${label}] Query failed — serving static fallback content.`, error)
    return fallback
  }
}
