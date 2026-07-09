interface HeroHeadlineProps {
  title: string
  subtitle: string
}

/** The `<h1>` (page's single top-level heading) plus its supporting subtitle line. */
export function HeroHeadline({ title, subtitle }: HeroHeadlineProps) {
  return (
    <>
      <h1 id="hero-heading" className="mt-4 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
        {title}
      </h1>
      <p className="mt-3 text-lg text-zinc-300">{subtitle}</p>
    </>
  )
}
