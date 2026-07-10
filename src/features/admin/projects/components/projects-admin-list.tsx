'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FolderKanban, Plus } from 'lucide-react'
import {
  AdminBadge,
  AdminCard,
  AdminPagination,
  AdminSearchInput,
  AdminSelect,
  ADMIN_PAGE_SIZE,
  EmptyState,
  SectionTitle,
} from '@/features/admin/shared'
import type { AdminProjectListItem, ProjectFilterKey, ProjectSortKey } from '../types'
import { ProjectRowActions } from './project-row-actions'

interface ProjectsAdminListProps {
  projects: AdminProjectListItem[]
}

const SORT_OPTIONS: Array<{ value: ProjectSortKey; label: string }> = [
  { value: 'order', label: 'Display order' },
  { value: 'name', label: 'Name' },
  { value: 'category', label: 'Category' },
  { value: 'updatedAt', label: 'Last updated' },
]

const FILTER_OPTIONS: Array<{ value: ProjectFilterKey; label: string }> = [
  { value: 'all', label: 'All projects' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
  { value: 'featured', label: 'Featured' },
]

function sortProjects(items: AdminProjectListItem[], sortKey: ProjectSortKey): AdminProjectListItem[] {
  const sorted = [...items]

  switch (sortKey) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
    case 'updatedAt':
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    case 'order':
    default:
      return sorted.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  }
}

function filterProjects(items: AdminProjectListItem[], filter: ProjectFilterKey): AdminProjectListItem[] {
  switch (filter) {
    case 'published':
      return items.filter((item) => item.published)
    case 'draft':
      return items.filter((item) => !item.published)
    case 'featured':
      return items.filter((item) => item.featured)
    case 'all':
    default:
      return items
  }
}

function searchProjects(items: AdminProjectListItem[], query: string): AdminProjectListItem[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return items

  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(normalized) ||
      item.category.toLowerCase().includes(normalized) ||
      item.slug.toLowerCase().includes(normalized),
  )
}

function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}

/** Client-side projects table with search, sort, filter, pagination, and row actions. */
export function ProjectsAdminList({ projects: initialProjects }: ProjectsAdminListProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])
  const [sortKey, setSortKey] = useState<ProjectSortKey>('order')
  const [filterKey, setFilterKey] = useState<ProjectFilterKey>('all')
  const [page, setPage] = useState(1)

  const visibleProjects = useMemo(() => {
    const searched = searchProjects(projects, search)
    const filtered = filterProjects(searched, filterKey)
    return sortProjects(filtered, sortKey)
  }, [projects, search, filterKey, sortKey])

  const totalPages = Math.max(1, Math.ceil(visibleProjects.length / ADMIN_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedProjects = visibleProjects.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE)

  function handleOptimisticUpdate(id: string, patch: Partial<AdminProjectListItem>) {
    setProjects((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleSortChange(value: string) {
    setSortKey(value as ProjectSortKey)
    setPage(1)
  }

  function handleFilterChange(value: string) {
    setFilterKey(value as ProjectFilterKey)
    setPage(1)
  }

  const isCompletelyEmpty = initialProjects.length === 0
  const hasNoMatches = !isCompletelyEmpty && visibleProjects.length === 0

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Projects"
        description="Manage the case studies shown in the public Projects section."
        action={
          <Link
            href="/admin/projects/new"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-4 text-sm font-medium text-white shadow-glow transition hover:bg-gradient-cta-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New project
          </Link>
        }
      />

      {isCompletelyEmpty ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to populate the public portfolio grid and case study pages."
          action={
            <Link
              href="/admin/projects/new"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-4 text-sm font-medium text-white shadow-glow transition hover:bg-gradient-cta-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create project
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_10rem]">
            <AdminSearchInput value={search} onChange={handleSearchChange} placeholder="Search by name, category, or slug" />
            <AdminSelect label="Filter" value={filterKey} onChange={handleFilterChange} options={FILTER_OPTIONS} />
            <AdminSelect label="Sort by" value={sortKey} onChange={handleSortChange} options={SORT_OPTIONS} />
          </div>

          {hasNoMatches ? (
            <EmptyState icon={FolderKanban} title="No matching projects" description="Try a different search term or filter." />
          ) : (
            <AdminCard padded={false}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[48rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Project
                      </th>
                      <th scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Category
                      </th>
                      <th scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Status
                      </th>
                      <th scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Updated
                      </th>
                      <th scope="col" className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedProjects.map((project) => (
                      <tr key={project.id} className="border-b border-white/[0.06] last:border-b-0">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md border border-white/[0.08] bg-background/60">
                              <Image src={project.screenshot} alt="" fill className="object-cover" sizes="64px" unoptimized />
                            </div>
                            <div className="min-w-0">
                              <Link href={`/admin/projects/${project.id}`} className="font-medium text-white hover:text-primary focus:outline-none focus-visible:underline">
                                {project.name}
                              </Link>
                              <p className="truncate text-xs text-zinc-500">/{project.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-zinc-400">{project.category}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <AdminBadge tone={project.published ? 'success' : 'warning'}>{project.published ? 'Published' : 'Draft'}</AdminBadge>
                            {project.featured && <AdminBadge tone="info">Featured</AdminBadge>}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-zinc-500">{formatUpdatedAt(project.updatedAt)}</td>
                        <td className="px-5 py-4">
                          <ProjectRowActions project={project} onOptimisticUpdate={handleOptimisticUpdate} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-white/[0.08] px-5 py-4">
                <AdminPagination page={currentPage} totalPages={totalPages} totalItems={visibleProjects.length} onPageChange={setPage} />
              </div>
            </AdminCard>
          )}
        </>
      )}
    </div>
  )
}
