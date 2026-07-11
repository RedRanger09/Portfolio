'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { BlogPostCard } from './blog-post-card'
import { collectBlogCategories } from '../lib/categories'
import type { BlogPostSummary } from '../types'
import { cn } from '@/shared/utils'

const PAGE_SIZE = 9

interface BlogIndexClientProps {
  posts: BlogPostSummary[]
}

/**
 * Client search / category filter / pagination over the server-fetched
 * published list — no external search service.
 */
export function BlogIndexClient({ posts }: BlogIndexClientProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | 'all'>('all')
  const [page, setPage] = useState(1)

  const categories = useMemo(() => collectBlogCategories(posts), [posts])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return posts.filter((post) => {
      if (category !== 'all' && post.category !== category) return false
      if (!needle) return true

      const haystack = [post.title, post.excerpt, post.category ?? '', ...post.tags].join(' ').toLowerCase()
      return haystack.includes(needle)
    })
  }, [posts, query, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const featured = !query && category === 'all' && currentPage === 1 ? filtered[0] : null
  const gridItems = featured ? pageItems.filter((post) => post.slug !== featured.slug) : pageItems

  function updateQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  function updateCategory(value: string | 'all') {
    setCategory(value)
    setPage(1)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <label htmlFor="blog-search" className="sr-only">
            Search articles
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search title, excerpt, tags…"
            className="w-full rounded-xl border border-white/[0.08] bg-background py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          />
        </div>

        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <FilterChip active={category === 'all'} onClick={() => updateCategory('all')}>
              All
            </FilterChip>
            {categories.map((item) => (
              <FilterChip key={item} active={category === item} onClick={() => updateCategory(item)}>
                {item}
              </FilterChip>
            ))}
          </div>
        ) : null}
      </div>

      <p className="text-sm text-zinc-500" aria-live="polite">
        {filtered.length === 0 ? 'No articles match your search.' : `${filtered.length} article${filtered.length === 1 ? '' : 's'}`}
      </p>

      {featured ? (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Featured</p>
          <BlogPostCard post={featured} featured />
        </div>
      ) : null}

      {gridItems.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gridItems.map((post) => (
            <li key={post.slug}>
              <BlogPostCard post={post} />
            </li>
          ))}
        </ul>
      ) : null}

      {totalPages > 1 ? (
        <nav className="flex items-center justify-center gap-2" aria-label="Blog pagination">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-sm text-zinc-300 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-sm text-zinc-300 disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        active ? 'border-cyan-500/40 bg-cyan-500/10 text-white' : 'border-white/[0.08] text-zinc-400 hover:text-white',
      )}
    >
      {children}
    </button>
  )
}
