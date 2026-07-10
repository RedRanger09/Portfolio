import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  FONT_SIZE_SCALE,
  LETTER_SPACING_VALUE,
  LINE_HEIGHT_VALUE,
  type AppearancePreferences,
  type AppearanceTheme,
} from './types'

export function resolveTheme(theme: AppearanceTheme): 'dark' | 'light' {
  if (theme !== 'system') return theme
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/** Applies appearance tokens to `<html>` — safe to call from inline FOUC script or React. */
export function applyAppearanceToDocument(preferences: AppearancePreferences) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const resolved = resolveTheme(preferences.theme)

  root.dataset.theme = resolved
  root.dataset.font = preferences.fontFamily
  root.style.setProperty('--font-scale', FONT_SIZE_SCALE[preferences.fontSize])
  root.style.setProperty('--letter-spacing', LETTER_SPACING_VALUE[preferences.letterSpacing])
  root.style.setProperty('--line-height', LINE_HEIGHT_VALUE[preferences.lineHeight])
  root.style.colorScheme = resolved
}

export function readStoredAppearance(): AppearancePreferences {
  if (typeof window === 'undefined') return DEFAULT_APPEARANCE

  try {
    const raw = window.localStorage.getItem(APPEARANCE_STORAGE_KEY)
    if (!raw) return DEFAULT_APPEARANCE
    const parsed = JSON.parse(raw) as Partial<AppearancePreferences>
    return {
      theme: parsed.theme ?? DEFAULT_APPEARANCE.theme,
      fontFamily: parsed.fontFamily ?? DEFAULT_APPEARANCE.fontFamily,
      fontSize: parsed.fontSize ?? DEFAULT_APPEARANCE.fontSize,
      letterSpacing: parsed.letterSpacing ?? DEFAULT_APPEARANCE.letterSpacing,
      lineHeight: parsed.lineHeight ?? DEFAULT_APPEARANCE.lineHeight,
    }
  } catch {
    return DEFAULT_APPEARANCE
  }
}

export function writeStoredAppearance(preferences: AppearancePreferences) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(preferences))
}
