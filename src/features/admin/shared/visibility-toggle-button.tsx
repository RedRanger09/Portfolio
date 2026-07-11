'use client'

import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/shared/utils'

interface VisibilityToggleButtonProps {
  isVisible: boolean
  disabled?: boolean
  onToggle: () => void
}

/**
 * Shared admin row action — soft-hide / show on the public website.
 * Matches existing 32×32 icon button styling used by Projects.
 */
export function VisibilityToggleButton({ isVisible, disabled, onToggle }: VisibilityToggleButtonProps) {
  const label = isVisible ? 'Hide from website' : 'Show on website'

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={isVisible}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50',
        isVisible
          ? 'border-white/[0.08] text-zinc-300 hover:border-white/20 hover:text-white'
          : 'border-zinc-600/40 bg-zinc-800/40 text-zinc-500 hover:border-white/20 hover:text-zinc-300',
      )}
    >
      {isVisible ? <Eye className="h-3.5 w-3.5" aria-hidden="true" /> : <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  )
}
