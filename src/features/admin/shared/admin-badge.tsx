import type { ReactNode } from 'react'
import { cn } from '@/shared/utils'

type AdminBadgeTone = 'neutral' | 'success' | 'warning' | 'info' | 'danger'

const TONE_CLASSES: Record<AdminBadgeTone, string> = {
  neutral: 'border-white/[0.08] bg-white/[0.04] text-zinc-400',
  success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
  info: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-400',
  danger: 'border-pink-500/25 bg-pink-500/10 text-pink-400',
}

interface AdminBadgeProps {
  children: ReactNode
  tone?: AdminBadgeTone
  className?: string
}

/** Small status pill reused across admin tables (featured, published, etc.). */
export function AdminBadge({ children, tone = 'neutral', className }: AdminBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide', TONE_CLASSES[tone], className)}>
      {children}
    </span>
  )
}
