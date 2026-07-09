import type { ReactNode } from 'react'
import { cn } from '@/shared/utils'

interface ProjectDetailSectionProps {
  title: string
  children: ReactNode
  className?: string
  /** Overrides the content card's padding/overflow — used by image-heavy sections (Architecture diagram, RAG pipeline) that need tighter padding than body-copy sections. */
  contentClassName?: string
  /** Skips the content card chrome entirely — used by sections (Screenshots) whose children already lay out their own bordered items and don't need an extra wrapping card. */
  bare?: boolean
}

/**
 * A titled card used throughout the case study body (Overview, Problem,
 * Tech Stack, Architecture, Implementation, Challenges, Lessons learned,
 * Future improvements, Screenshots, Demo). Deliberately simpler than the
 * homepage's `SectionHeader` (no eyebrow, no glow, no scroll-reveal
 * animation) — this page is a dense, scannable document, not a
 * scroll-discovery experience, matching the legacy case study's own
 * section treatment.
 */
export function ProjectDetailSection({ title, children, className, contentClassName, bare = false }: ProjectDetailSectionProps) {
  return (
    <section className={cn('mt-10', className)}>
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
      {bare ? (
        <div className="mt-5">{children}</div>
      ) : (
        <div className={cn('mt-5 rounded-2xl border border-white/[0.08] bg-surface/70 p-6 sm:p-7', contentClassName)}>
          {children}
        </div>
      )}
    </section>
  )
}
