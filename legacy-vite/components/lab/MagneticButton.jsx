import useMagnetic from '../../hooks/useMagnetic.js'
import { cn } from '../../utils/helpers.js'

function MagneticButton({ href, children, className = '', variant = 'primary', download, ariaLabel }) {
  const { ref, onMouseMove, onMouseLeave } = useMagnetic(0.28)
  const isExternal = href.startsWith('http') || href.startsWith('mailto:')

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

export default MagneticButton
