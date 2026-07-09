'use client'

import type { ReactNode } from 'react'
import { useMagnetic } from '@/shared/hooks'
import { cn, isExternalHref } from '@/shared/utils'

export type MagneticButtonVariant = 'primary' | 'secondary'

interface MagneticButtonProps {
  href: string
  children: ReactNode
  variant?: MagneticButtonVariant
  download?: boolean
  ariaLabel?: string
  className?: string
}

/**
 * A link styled as a button with a subtle cursor-follow ("magnetic") effect.
 * Used for every primary/secondary CTA across the site. Requires the client
 * for the mousemove-driven transform — see `useMagnetic`.
 */
export function MagneticButton({ href, children, variant = 'primary', download, ariaLabel, className = '' }: MagneticButtonProps) {
  const { ref, onMouseMove, onMouseLeave } = useMagnetic(0.28)
  const isExternal = isExternalHref(href)

  const styles =
    variant === 'primary'
      ? 'border-primary/30 bg-gradient-cta text-white shadow-glow hover:bg-gradient-cta-hover'
      : 'border-white/[0.08] bg-surface text-white hover:border-primary/40'

  return (
    <a
      ref={ref}
      href={href}
      download={download}
      aria-label={ariaLabel}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      target={isExternal && !download ? '_blank' : undefined}
      rel={isExternal && !download ? 'noreferrer' : undefined}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/60',
        styles,
        className,
      )}
    >
      {children}
    </a>
  )
}
