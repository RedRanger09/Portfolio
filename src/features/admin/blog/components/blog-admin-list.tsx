'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Newspaper, Plus } from 'lucide-react'
import { AdminBadge, AdminCard, AdminPagination, AdminSearchInput, AdminSelect, ADMIN_PAGE_SIZE, EmptyState, SectionTitle } from '@/features/admin/shared'
import type { AdminBlogListItem, BlogFilterKey, BlogSortKey } from '../types'
import { BlogRowActions } from './blog-row-actions'

interface BlogAdminListProps {
  posts: AdminBlogListItem[]
}

const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'title', label: 'Title' },
  { value: 'publishedAt', label: 'Published date' },
] as const

const FILTER_OPTIONS = [
  { value: 'all', label: 'All posts' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
] as const

export function BlogAdminList({ posts: initialPosts }: BlogAdminListProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<BlogSortKey>('updatedAt')
  const [filterKey, setFilterKey] = useState<BlogFilterKey>('all')
  const [page, setPage] = useState(1)

  useEffect(() => { setPosts(initialPosts) }, [initialPosts])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    let items = posts.filter((post) => {
      if (filterKey === 'published' && !post.published) return false
      if (filterKey === 'draft' && post.published) return false
      if (!q) return true
      return post.title.toLowerCase().includes(q) || post.slug.toLowerCase().includes(q) || post.tags.some((tag) => tag.toLowerCase().includes(q))
    })

    items = [...items].sort((a, b) => {
      if (sortKey === 'title') return a.title.localeCompare(b.title)
      if (sortKey === 'publishedAt') return new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime()
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    return items
  }, [posts, search, filterKey, sortKey])

  const totalPages = Math.max(1, Math.ceil(visible.length / ADMIN_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = visible.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionTitle title="Blog" description="Write and publish blog posts with markdown content, tags, and SEO metadata." />
        <Link href="/admin/blog/new" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/30 bg-gradient-cta px-4 text-sm font-medium text-white shadow-glow transition hover:bg-gradient-cta-hover">
          <Plus className="h-4 w-4" />
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <EmptyState icon={Newspaper} title="No blog posts yet" description="Create your first post to start publishing." action={<Link href="/admin/blog/new" className="text-sm text-primary hover:text-primary-hover">Create post</Link>} />
      ) : (
        <>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
            <AdminSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search by title, slug, or tag" />
            <AdminSelect label="Filter" value={filterKey} onChange={(v) => { setFilterKey(v as BlogFilterKey); setPage(1) }} options={FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
            <AdminSelect label="Sort" value={sortKey} onChange={(v) => setSortKey(v as BlogSortKey)} options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
          </div>

          <AdminCard padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Post</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Status</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Tags</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Updated</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((post) => (
                    <tr key={post.id} className="border-b border-white/[0.06] last:border-b-0">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-16 overflow-hidden rounded border border-white/[0.08] bg-background/60">
                            {post.featuredImage ? <Image src={post.featuredImage} alt="" fill className="object-cover" sizes="64px" unoptimized={post.featuredImage.startsWith('/')} /> : null}
                          </div>
                          <div>
                            <p className="font-medium text-white">{post.title}</p>
                            <p className="text-xs text-zinc-500">/{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><AdminBadge tone={post.published ? 'success' : 'neutral'}>{post.published ? 'Published' : 'Draft'}</AdminBadge></td>
                      <td className="px-5 py-4 text-xs text-zinc-400">{post.tags.length ? post.tags.join(', ') : '—'}</td>
                      <td className="px-5 py-4 text-xs text-zinc-400">{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(post.updatedAt))}</td>
                      <td className="px-5 py-4"><BlogRowActions post={post} onOptimisticUpdate={(id, patch) => setPosts((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p)))} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-white/[0.08] px-5 py-4">
              <AdminPagination page={currentPage} totalPages={totalPages} totalItems={visible.length} onPageChange={setPage} />
            </div>
          </AdminCard>
        </>
      )}
    </div>
  )
}
