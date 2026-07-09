import { ArrowUpRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn, isExternalHref } from '../utils/helpers.js'
import { fadeInUp, revealViewport, transition } from '../utils/motion.js'

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = '',
  containerClassName = '',
  align = 'center',
  as: Tag = 'section',
}) {
  const shouldReduceMotion = useReducedMotion()
  const isCentered = align === 'center'

  return (
    <Tag id={id} className={cn('scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24', className)}>
      <div className={cn('mx-auto max-w-6xl', containerClassName)}>
        {(eyebrow || title || description) && (
          <motion.div
            {...(shouldReduceMotion ? {} : fadeInUp)}
            viewport={revealViewport}
            transition={transition}
            className={cn(
              'mb-10 max-w-3xl lg:mb-14',
              isCentered ? 'mx-auto text-center' : 'text-left',
            )}
          >
            {eyebrow && (
              <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-accent sm:text-xs">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.7rem] lg:leading-[1.05]">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
                {description}
              </p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </Tag>
  )
}

export function GlassCard({ children, className = '', as: Tag = 'div' }) {
  return (
    <Tag
      className={cn(
        'rounded-[1.75rem] border border-white/[0.08] bg-surface p-6 shadow-card backdrop-blur-xl transition-colors duration-300 sm:p-7',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function Badge({ children, className = '' }) {
  return (
    <span className={cn('inline-flex rounded-full border border-white/[0.08] bg-background px-3 py-1.5 text-xs font-medium text-zinc-400', className)}>
      {children}
    </span>
  )
}

export function StatCard({ label, value, className = '' }) {
  return (
    <GlassCard className={cn('p-5 sm:p-6', className)}>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-3 text-lg font-semibold tracking-tight text-white sm:text-xl">{value}</p>
    </GlassCard>
  )
}

export function DetailList({ items, accent = false, className = '' }) {
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => (
        <div
          key={item}
          className={cn(
            'rounded-2xl border px-4 py-4 text-sm leading-7 text-zinc-300',
            accent ? 'border-primary/20 bg-gradient-highlight text-zinc-200' : 'border-white/[0.08] bg-background',
          )}
        >
          {item}
        </div>
      ))}
    </div>
  )
}

function BaseLink({ href, children, className = '', download = false, variant = 'primary', ariaLabel }) {
  const external = isExternalHref(href)
  const styles =
    variant === 'primary'
      ? 'border-primary/30 bg-gradient-cta text-white shadow-glow hover:-translate-y-0.5 hover:bg-gradient-cta-hover'
      : 'border-white/[0.08] bg-surface text-white hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface/90'

  return (
    <a
      href={href}
      download={download}
      aria-label={ariaLabel}
      target={external && !download ? '_blank' : undefined}
      rel={external && !download ? 'noreferrer' : undefined}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary/70',
        styles,
        className,
      )}
    >
      {children}
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </a>
  )
}

export function PrimaryLink(props) {
  return <BaseLink {...props} variant="primary" />
}

export function SecondaryLink(props) {
  return <BaseLink {...props} variant="secondary" />
}
