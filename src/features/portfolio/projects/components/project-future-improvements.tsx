interface ProjectFutureImprovementsProps {
  items: string[]
}

/** Highlighted "what's next" cards, visually distinct from `ProjectDetailList`'s neutral cards. Returns null if empty. */
export function ProjectFutureImprovements({ items }: ProjectFutureImprovementsProps) {
  if (items.length === 0) return null

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <li key={item} className="rounded-3xl border border-primary/20 bg-gradient-highlight p-5 text-sm leading-7 text-zinc-300">
          {item}
        </li>
      ))}
    </ul>
  )
}
