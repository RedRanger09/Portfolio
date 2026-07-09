interface HeroDescriptionProps {
  description: string
}

export function HeroDescription({ description }: HeroDescriptionProps) {
  return <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-400">{description}</p>
}
