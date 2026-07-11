'use client'

import { MagneticButton } from '@/shared/components'
import { HERO_CTA_ICONS } from '../constants/icons'
import type { HeroCta, HeroCtaIcon } from '../types'
import { cn } from '@/shared/utils'

interface HeroCtaGroupProps {
  ctas: HeroCta[]
}

function SocialBrandIcon({ icon, className }: { icon: HeroCtaIcon; className?: string }) {
  if (icon === 'GitBranch') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
      </svg>
    )
  }

  if (icon === 'BriefcaseBusiness') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
        <path d="M20.45 20.45H3.55V9h16.9v11.45ZM8.67 4.5A1.5 1.5 0 0 1 10.17 3h3.66a1.5 1.5 0 0 1 1.5 1.5V6h4.62A2.55 2.55 0 0 1 22.5 8.55v11.9A2.55 2.55 0 0 1 19.95 23H4.05A2.55 2.55 0 0 1 1.5 20.45V8.55A2.55 2.55 0 0 1 4.05 6h4.62V4.5Zm1.5.75V6h3.66V5.25H10.17Z" />
      </svg>
    )
  }

  const Icon = HERO_CTA_ICONS[icon]
  return <Icon className={className} aria-hidden="true" />
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
            <Icon className="h-4 w-4" aria-hidden="true" />
            {cta.label}
          </MagneticButton>
        )
      })}

      {socialCtas.length > 0 ? (
        <div className="flex items-center gap-2">
          {socialCtas.map((cta) => (
            <span key={cta.label} className="group relative">
              <MagneticButton
                href={cta.href}
                variant="secondary"
                ariaLabel={cta.label}
                className={cn('h-11 w-11 min-h-11 rounded-full px-0 py-0')}
              >
                <SocialBrandIcon icon={cta.icon} className="h-4 w-4" />
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
