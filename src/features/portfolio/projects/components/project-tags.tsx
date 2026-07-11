'use client'

import { getSimpleIconUrl, getTechLogoSlug } from '@/constants/tech-logos'
import { cn } from '@/shared/utils'

interface ProjectTagsProps {
  techStack: string[]
  /** Caps how many badges render — the featured showcase and grid cards use different limits. */
  limit?: number
  /** Spacing/margin utilities — the featured showcase and grid cards use different gaps. */
  className?: string
}

/**
 * Small technology badges with a colored brand logo. No motion, but the
 * `onError` fallback on each `<img>` is a real event handler, which is why
 * this needs its own `'use client'` boundary — it can't be a plain Server
 * Component even though it renders no interactive UI, since Server
 * Components can't pass event handler props down at all. Every previous
 * call site happened to already be inside a client-marked ancestor
 * (`ProjectFeatured`, `ProjectCard`), which is why this went unnoticed
 * until the case-study page rendered it from a Server Component directly.
 */
export function ProjectTags({ techStack, limit, className = 'gap-2' }: ProjectTagsProps) {
  const items = limit ? techStack.slice(0, limit) : techStack

  return (
    <ul className={cn('flex flex-wrap', className)}>
      {items.map((tech) => (
        <li
          key={tech}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-background/70 px-2.5 py-1 text-[0.65rem] text-zinc-400 transition hover:border-white/15 hover:text-zinc-300"
        >
          {/*
            eslint-disable-next-line @next/next/no-img-element --
            Remote SVG from the Simple Icons CDN: next/image would need
            `images.dangerouslyAllowSVG` app-wide for a tiny badge icon.
          */}
          <img
            src={getSimpleIconUrl(getTechLogoSlug(tech))}
            alt=""
            width={11}
            height={11}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          {tech}
        </li>
      ))}
    </ul>
  )
}
