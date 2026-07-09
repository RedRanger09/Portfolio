import type { SectionId } from '@/shared/types'

interface SectionPlaceholderProps {
  id: SectionId
  label: string
}

/**
 * TEMPORARY Phase 2 scaffold.
 *
 * Renders an empty, correctly-`id`'d `<section>` so the Navbar's ScrollSpy
 * and anchor links (`#about`, `#projects`, ...) have real targets to test
 * against before the actual section UI is ported in Phase 3.
 *
 * Delete this file and the `src/components/placeholders/` folder once every
 * section in `HOME_SECTION_ORDER` has a real implementation.
 */
export function SectionPlaceholder({ id, label }: SectionPlaceholderProps) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-dashed border-white/10 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-600">#{id}</p>
        <p className="mt-2 text-lg font-medium text-zinc-500">{label}</p>
        <p className="mt-1 text-xs text-zinc-700">Section UI arrives in Phase 3</p>
      </div>
    </section>
  )
}
