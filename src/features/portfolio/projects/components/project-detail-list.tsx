interface ProjectDetailListProps {
  items: string[]
}

/**
 * Rounded bullet cards used for Architecture, Implementation, Challenges,
 * and Lessons-learned content — a real `<ul>/<li>` (the legacy version used
 * plain `<div>`s for this list, which this migration corrects for screen
 * readers). Returns null if there's nothing to show.
 */
export function ProjectDetailList({ items }: ProjectDetailListProps) {
  if (items.length === 0) return null

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="rounded-2xl border border-white/[0.08] bg-background px-4 py-4 text-sm leading-7 text-zinc-300">
          {item}
        </li>
      ))}
    </ul>
  )
}
