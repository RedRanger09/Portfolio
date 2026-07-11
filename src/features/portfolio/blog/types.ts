export interface BlogPostSummary {
  slug: string
  title: string
  excerpt: string
  tags: string[]
  /** First tag used as a soft category for display/filtering (no BlogCategory model). */
  category: string | null
  featuredImage: string
  featuredImageAlt: string
  publishedAt: string
  readingTimeMinutes: number
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string
  metaTitle: string | null
  metaDescription: string | null
  updatedAt: string
}

export interface BlogAdjacentPosts {
  previous: BlogPostSummary | null
  next: BlogPostSummary | null
}
