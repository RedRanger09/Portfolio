import { notFound } from 'next/navigation'

/**
 * Without this, a mistyped `/admin/*` URL wouldn't match any `page.tsx`
 * at all, and Next.js's router sends genuinely unmatched paths straight
 * to `app/global-not-found.tsx` — the last-resort, no-admin-chrome 404 —
 * bypassing `admin/not-found.tsx` entirely (that file only renders for
 * an explicit `notFound()` call *within* an already-matched route tree,
 * which nothing under `/admin` triggers yet since there's no dynamic
 * segment here). This catch-all *is* a match, so the router enters the
 * `/admin` layout tree normally; calling `notFound()` from inside it then
 * correctly bubbles to the nearest boundary — `admin/not-found.tsx`,
 * rendered inside `AdminShell` as intended.
 */
export default function AdminCatchAllPage() {
  notFound()
}
