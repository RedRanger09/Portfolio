import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Share2 } from 'lucide-react'
import { SITE } from '@/config/site.config'
import { env } from '@/config/env'
import { BlogMarkdown } from './blog-markdown'
import { BlogPostCard } from './blog-post-card'
import type { BlogAdjacentPosts, BlogPostDetail, BlogPostSummary } from '../types'

interface BlogArticleProps {
  post: BlogPostDetail
  adjacent: BlogAdjacentPosts
  related: BlogPostSummary[]
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(iso))
}

/** Full article layout — content from Prisma only. */
export function BlogArticle({ post, adjacent, related }: BlogArticleProps) {
  const url = `${env.appUrl}/blog/${post.slug}`
  const shareText = encodeURIComponent(post.title)
  const shareUrl = encodeURIComponent(url)

  return (
    <article className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Blog
        </Link>

        <header>
          {post.category ? (
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cyan-400">{post.category}</p>
          ) : null}
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg leading-8 text-zinc-300">{post.excerpt}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500">
            <span>{SITE.name}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingTimeMinutes} min read</span>
          </div>

          {post.tags.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        {post.featuredImage ? (
          <div className="relative mt-10 aspect-[16/10] overflow-hidden rounded-[1.75rem] border border-white/[0.08]">
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              unoptimized={post.featuredImage.startsWith('/')}
            />
          </div>
        ) : null}

        <div className="mt-10">
          <BlogMarkdown content={post.content} />
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-8">
          <p className="inline-flex items-center gap-2 text-sm text-zinc-500">
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share
          </p>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            X / Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            LinkedIn
          </a>
        </div>

        {(adjacent.previous || adjacent.next) && (
          <nav className="mt-10 grid gap-4 border-t border-white/[0.08] pt-8 sm:grid-cols-2" aria-label="Adjacent articles">
            {adjacent.previous ? (
              <Link href={`/blog/${adjacent.previous.slug}`} className="rounded-2xl border border-white/[0.08] p-4 transition hover:border-white/20">
                <p className="inline-flex items-center gap-1 text-xs text-zinc-500">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Previous
                </p>
                <p className="mt-2 text-sm font-medium text-white">{adjacent.previous.title}</p>
              </Link>
            ) : (
              <div />
            )}
            {adjacent.next ? (
              <Link href={`/blog/${adjacent.next.slug}`} className="rounded-2xl border border-white/[0.08] p-4 text-right transition hover:border-white/20 sm:justify-self-end">
                <p className="inline-flex items-center justify-end gap-1 text-xs text-zinc-500">
                  Next
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </p>
                <p className="mt-2 text-sm font-medium text-white">{adjacent.next.title}</p>
              </Link>
            ) : null}
          </nav>
        )}

        {related.length > 0 ? (
          <section className="mt-14" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-lg font-semibold text-white">
              Related writing
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <BlogPostCard post={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  )
}
