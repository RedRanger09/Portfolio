interface ProjectContentProps {
  category: string
  name: string
  tagline: string
}

/** Category label, name, and tagline for a grid card. Pure text — no motion, no state. */
export function ProjectContent({ category, name, tagline }: ProjectContentProps) {
  return (
    <>
      <p className="font-mono text-xs text-zinc-500">{category}</p>
      <h3 className="mt-1.5 text-base font-semibold text-white">{name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{tagline}</p>
    </>
  )
}
