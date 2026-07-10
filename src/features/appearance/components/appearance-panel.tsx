'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, Moon, Palette, RotateCcw, Sun, Type } from 'lucide-react'
import { useAppearance } from '../appearance-provider'
import type {
  AppearanceFontFamily,
  AppearanceFontSize,
  AppearanceLetterSpacing,
  AppearanceLineHeight,
  AppearanceTheme,
} from '../types'
import { cn } from '@/shared/utils'

const THEME_OPTIONS: { value: AppearanceTheme; label: string; icon: typeof Sun }[] = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Palette },
]

const FONT_FAMILY_OPTIONS: { value: AppearanceFontFamily; label: string; sample: string }[] = [
  { value: 'sans', label: 'Sans', sample: 'Aa' },
  { value: 'serif', label: 'Serif', sample: 'Aa' },
  { value: 'mono', label: 'Mono', sample: 'Aa' },
]

const FONT_SIZE_OPTIONS: { value: AppearanceFontSize; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'xl', label: 'XL' },
]

const TRACKING_OPTIONS: { value: AppearanceLetterSpacing; label: string }[] = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
]

const LEADING_OPTIONS: { value: AppearanceLineHeight; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' },
]

/**
 * Fixed top-right Appearance control — theme + typography preferences for
 * public visitors. Preferences persist in localStorage.
 */
export function AppearancePanel() {
  const { preferences, setPreferences, resetPreferences } = useAppearance()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="fixed right-3 top-3 z-[60] sm:right-4 sm:top-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-bg)] px-3 py-2 text-sm font-medium text-[var(--chrome-text)] shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 sm:px-3.5"
      >
        <Palette className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Appearance</span>
        <span className="sm:hidden">Look</span>
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Appearance settings"
          className="absolute right-0 mt-2 w-[min(100vw-1.5rem,20rem)] rounded-2xl border border-[var(--chrome-border)] bg-[var(--chrome-bg)] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--chrome-text)]">Appearance</p>
            <button
              type="button"
              onClick={resetPreferences}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-[var(--chrome-muted)] transition hover:text-[var(--chrome-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Reset
            </button>
          </div>

          <section className="mt-4" aria-label="Color theme">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--chrome-muted)]">Theme</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon
                const selected = preferences.theme === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPreferences({ theme: option.value })}
                    className={cn(
                      'inline-flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
                      selected
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-[var(--chrome-text)]'
                        : 'border-[var(--chrome-border)] text-[var(--chrome-muted)] hover:text-[var(--chrome-text)]',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {option.label}
                    {selected ? <Check className="h-3 w-3 text-cyan-400" aria-hidden="true" /> : <span className="h-3" />}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="mt-5" aria-label="Font settings">
            <p className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--chrome-muted)]">
              <Type className="h-3 w-3" aria-hidden="true" />
              Font
            </p>

            <p className="mt-3 text-xs text-[var(--chrome-muted)]">Family</p>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {FONT_FAMILY_OPTIONS.map((option) => {
                const selected = preferences.fontFamily === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPreferences({ fontFamily: option.value })}
                    className={cn(
                      'rounded-xl border px-2 py-2 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
                      selected
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-[var(--chrome-text)]'
                        : 'border-[var(--chrome-border)] text-[var(--chrome-muted)] hover:text-[var(--chrome-text)]',
                      option.value === 'serif' && 'font-serif',
                      option.value === 'mono' && 'font-mono',
                    )}
                  >
                    <span className="block text-base leading-none">{option.sample}</span>
                    <span className="mt-1 block text-[0.65rem]">{option.label}</span>
                  </button>
                )
              })}
            </div>

            <p className="mt-3 text-xs text-[var(--chrome-muted)]">Size</p>
            <div className="mt-1.5 grid grid-cols-4 gap-1.5">
              {FONT_SIZE_OPTIONS.map((option) => {
                const selected = preferences.fontSize === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPreferences({ fontSize: option.value })}
                    className={cn(
                      'rounded-xl border px-2 py-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
                      selected
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-[var(--chrome-text)]'
                        : 'border-[var(--chrome-border)] text-[var(--chrome-muted)] hover:text-[var(--chrome-text)]',
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>

            <p className="mt-3 text-xs text-[var(--chrome-muted)]">Letter spacing</p>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {TRACKING_OPTIONS.map((option) => {
                const selected = preferences.letterSpacing === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPreferences({ letterSpacing: option.value })}
                    className={cn(
                      'rounded-xl border px-2 py-2 text-[0.7rem] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
                      selected
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-[var(--chrome-text)]'
                        : 'border-[var(--chrome-border)] text-[var(--chrome-muted)] hover:text-[var(--chrome-text)]',
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>

            <p className="mt-3 text-xs text-[var(--chrome-muted)]">Line height</p>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {LEADING_OPTIONS.map((option) => {
                const selected = preferences.lineHeight === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPreferences({ lineHeight: option.value })}
                    className={cn(
                      'rounded-xl border px-2 py-2 text-[0.7rem] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
                      selected
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-[var(--chrome-text)]'
                        : 'border-[var(--chrome-border)] text-[var(--chrome-muted)] hover:text-[var(--chrome-text)]',
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
