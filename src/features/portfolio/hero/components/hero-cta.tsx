'use client'

import { MagneticButton } from '@/shared/components'
import { HERO_CTA_ICONS } from '../constants/icons'
import type { HeroCta, HeroCtaIcon } from '../types'
import { cn } from '@/shared/utils'

interface HeroCtaGroupProps {
  ctas: HeroCta[]
}

/** Brand marks with explicit pixel size — avoids globals.css `svg { max-width:100% }` collapse. */
function SocialBrandIcon({ icon }: { icon: HeroCtaIcon }) {
  if (icon === 'GitBranch') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={22}
        height={22}
        className="shrink-0 max-w-none text-white"
        aria-hidden="true"
        fill="currentColor"
      >
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
      </svg>
    )
  }

  if (icon === 'BriefcaseBusiness') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={22}
        height={22}
        className="shrink-0 max-w-none text-white"
        aria-hidden="true"
        fill="currentColor"
      >
        <path d="M20.447 20.452H16.89v-5.569c0-1.328-.025-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a1.98 1.98 0 1 1-.004-3.961 1.98 1.98 0 0 1 .004 3.961zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )
  }

  const Icon = HERO_CTA_ICONS[icon]
  return <Icon size={22} className="shrink-0 max-w-none" aria-hidden="true" />
}

/**
 * Primary action row.
 * Full buttons for primary/secondary (View Projects / Download Resume).
 * Compact icon-only magnetic buttons for ghost social links (GitHub / LinkedIn).
 */
export function HeroCtaGroup({ ctas }: HeroCtaGroupProps) {
  const primaryCtas = ctas.filter((cta) => cta.variant !== 'ghost')
  const socialCtas = ctas.filter((cta) => cta.variant === 'ghost')

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {primaryCtas.map((cta) => {
        const Icon = HERO_CTA_ICONS[cta.icon]
        return (
          <MagneticButton
            key={cta.label}
            href={cta.href}
            download={cta.download}
            variant={cta.variant === 'primary' ? 'primary' : 'secondary'}
            ariaLabel={cta.label}
          >
            <Icon className="h-4 w-4 shrink-0 max-w-none" aria-hidden="true" />
            {cta.label}
          </MagneticButton>
        )
      })}

      {socialCtas.length > 0 ? (
        <div className="flex items-center gap-2.5">
          {socialCtas.map((cta) => (
            <span key={cta.label} className="group relative">
              <MagneticButton
                href={cta.href}
                variant="secondary"
                ariaLabel={cta.label}
                className={cn(
                  'h-12 w-12 min-h-12 min-w-12 shrink-0 rounded-full px-0 py-0 text-white',
                  '[&_svg]:h-[22px] [&_svg]:w-[22px] [&_svg]:max-w-none',
                )}
              >
                <SocialBrandIcon icon={cta.icon} />
              </MagneticButton>
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/[0.08] bg-surface px-2 py-1 text-xs text-zinc-300 opacity-0 shadow-card transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
              >
                {cta.label}
              </span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
