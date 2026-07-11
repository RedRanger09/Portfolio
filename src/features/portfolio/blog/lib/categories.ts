import type { BlogPostSummary } from '../types'

/** Unique categories (first tags) across published posts — empty ⇒ hide filter. */
export function collectBlogCategories(posts: BlogPostSummary[]): string[] {
  const seen = new Set<string>()
  for (const post of posts) {
    if (post.category) seen.add(post.category)
  }
  return [...seen].sort((a, b) => a.localeCompare(b))
}
