interface HeroBadgeProps {
  eyebrow: string
}

/**
 * Small mono-font eyebrow label above the headline. No motion or state of
 * its own — the entrance animation belongs to `HeroContent`, its parent.
 */
export function HeroBadge({ eyebrow }: HeroBadgeProps) {
  return <p className="font-mono text-xs tracking-widest text-cyan-400">{eyebrow}</p>
}
