/**
 * Generic, dependency-free helper functions reused across features and
 * layout components. Deliberately kept in one file: each function is a
 * one-line pure transform, and splitting them into separate files would
 * add import overhead without improving discoverability.
 */

/** Joins conditional class names, filtering out falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/** Whether an href points outside the app (http/https/mailto) — used to decide `target="_blank"`. */
export function isExternalHref(href = ''): boolean {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')
}
