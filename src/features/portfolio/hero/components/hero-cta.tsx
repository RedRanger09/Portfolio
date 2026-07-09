import { MagneticButton } from '@/shared/components'
import { HERO_CTA_ICONS } from '../constants/icons'
import type { HeroCta } from '../types'

interface HeroCtaGroupProps {
  ctas: HeroCta[]
}

/**
 * Primary action row (View Projects / Download Resume / GitHub / LinkedIn).
 * `MagneticButton` only has two visual styles — anything other than
 * `'primary'` renders as `'secondary'`, matching the legacy behavior where
 * `'ghost'`-flagged CTAs (GitHub, LinkedIn) still render as secondary buttons.
 */
export function HeroCtaGroup({ ctas }: HeroCtaGroupProps) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {ctas.map((cta) => {
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
    </div>
  )
}
