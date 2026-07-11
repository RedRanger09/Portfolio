import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BlogPostCard } from './blog-post-card'
import { getLatestPublishedBlogPosts } from '../data'

/**
 * Homepage “Latest Writing” preview — sits below Contact, above Footer.
 * Hidden entirely when there are no published posts.
 */
export async function LatestWritingSection() {
  const posts = await getLatestPublishedBlogPosts(3)
  if (posts.length === 0) return null

  return (
    <section aria-labelledby="latest-writing-heading" className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-zinc-500">Writing</p>
            <h2 id="latest-writing-heading" className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Latest writing
            </h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">Notes and essays from the portfolio — short reads, shipped when ready.</p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            View all articles
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <BlogPostCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
