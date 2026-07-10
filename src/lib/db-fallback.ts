/**
 * Shared "read from the database, fall back to static content on failure"
 * wrapper — used by every migrated feature's `data.ts` (`ARCHITECTURE.md §4`,
 * `docs/infrastructure/phase-5-3-implementation-notes.md`).
 *
 * This is the one genuinely repeated query pattern across all nine
 * portfolio features: singleton sections (Hero, About, Resume,
 * ContactInformation) fetch a single row that can come back `null`; list
 * sections (Projects, Skills, Journey, Education, Certifications) fetch an
 * array that can come back empty. Both are "the database didn't give us
 * anything usable" and should be handled identically — log clearly, then
 * serve the last-known-good static content instead of a broken or empty
 * section. A single generic helper here is the intentionally small
 * repository-layer abstraction this phase's brief allows for ("if repeated
 * query patterns naturally appear, introduce small feature-specific
 * repositories") — everything else stays as plain functions in each
 * feature's own `data.ts`.
 */

/**
 * Runs `queryFn`, returning its result unless the database is unreachable
 * (any thrown error — connection refused, query timeout, misconfigured
 * `DATABASE_URL`, etc.) or returns nothing usable (`null`, or an empty
 * array where the static fallback has content). In either case, logs a
 * clear, labeled error and returns `fallback` instead of throwing —
 * the public portfolio must never 500 because of a database hiccup.
 */
export async function withDbFallback<T>(queryFn: () => Promise<T | null>, fallback: T, label: string): Promise<T> {
  try {
    const result = await queryFn()

    if (isEmptyResult(result)) {
      console.error(`[db:${label}] Query returned no data — serving static fallback content.`)
      return fallback
    }

    // `isEmptyResult` above has already ruled out `null`/`undefined`/empty-array.
    return result as T
  } catch (error) {
    console.error(`[db:${label}] Query failed — serving static fallback content.`, error)
    return fallback
  }
}

function isEmptyResult<T>(result: T | null): boolean {
  if (result === null || result === undefined) return true
  if (Array.isArray(result)) return result.length === 0
  return false
}
