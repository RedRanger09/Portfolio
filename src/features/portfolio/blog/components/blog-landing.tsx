import { BlogIndexClient } from './blog-index-client'
import type { BlogPostSummary } from '../types'

interface BlogLandingProps {
  posts: BlogPostSummary[]
}

/** Server-rendered landing shell; search/filter hydrate in `BlogIndexClient`. */
export function BlogLanding({ posts }: BlogLandingProps) {
  return (
    <div className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-zinc-500">Blog</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Writing</h1>
          <p className="mt-4 text-base leading-8 text-zinc-400">
            Essays and notes on building, learning, and shipping — the public reading side of this portfolio.
          </p>
        </header>

        <div className="mt-12">
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-white/[0.08] bg-surface/60 px-6 py-14 text-center text-sm text-zinc-500">
              No published articles yet. Check back soon.
            </p>
          ) : (
            <BlogIndexClient posts={posts} />
          )}
        </div>
      </div>
    </div>
  )
}
