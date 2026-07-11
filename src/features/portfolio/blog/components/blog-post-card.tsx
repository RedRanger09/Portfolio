import Link from 'next/link'
import Image from 'next/image'
import type { BlogPostSummary } from '../types'

interface BlogPostCardProps {
  post: BlogPostSummary
  featured?: boolean
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso))
}

/** Shared article card for landing, homepage preview, and related posts. */
export function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  return (
    <article
      className={
        featured
          ? 'overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-surface/70 shadow-card'
          : 'flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/60 transition hover:border-white/15'
      }
    >
      <Link href={`/blog/${post.slug}`} className="group relative block aspect-[16/10] overflow-hidden bg-black/30">
        <Image
          src={post.featuredImage}
          alt={post.featuredImageAlt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes={featured ? '(max-width: 768px) 100vw, 960px' : '(max-width: 768px) 100vw, 360px'}
          unoptimized={post.featuredImage.startsWith('/')}
        />
      </Link>

      <div className={`flex flex-1 flex-col ${featured ? 'p-6 sm:p-8' : 'p-5'}`}>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingTimeMinutes} min read</span>
          {post.category ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-zinc-300">{post.category}</span>
            </>
          ) : null}
        </div>

        <h3 className={`mt-3 font-semibold tracking-tight text-white ${featured ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
          <Link href={`/blog/${post.slug}`} className="transition hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            {post.title}
          </Link>
        </h3>

        <p className={`mt-3 text-sm leading-7 text-zinc-400 ${featured ? 'sm:text-base' : 'line-clamp-3'}`}>{post.excerpt}</p>

        <div className="mt-auto pt-5">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex text-sm font-medium text-cyan-400 transition hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Read article
            <span className="sr-only">: {post.title}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
