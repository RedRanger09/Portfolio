'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { applyAppearanceToDocument, readStoredAppearance, resolveTheme, writeStoredAppearance } from './apply-appearance'
import { DEFAULT_APPEARANCE, type AppearancePreferences } from './types'

interface AppearanceContextValue {
  preferences: AppearancePreferences
  resolvedTheme: 'dark' | 'light'
  setPreferences: (next: Partial<AppearancePreferences>) => void
  resetPreferences: () => void
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null)

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<AppearancePreferences>(DEFAULT_APPEARANCE)
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = readStoredAppearance()
    setPreferencesState(stored)
    setResolvedTheme(resolveTheme(stored.theme))
    applyAppearanceToDocument(stored)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || preferences.theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: light)')
    const sync = () => {
      setResolvedTheme(resolveTheme('system'))
      applyAppearanceToDocument(preferences)
    }

    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [preferences, ready])

  const setPreferences = useCallback((next: Partial<AppearancePreferences>) => {
    setPreferencesState((current) => {
      const merged = { ...current, ...next }
      writeStoredAppearance(merged)
      applyAppearanceToDocument(merged)
      setResolvedTheme(resolveTheme(merged.theme))
      return merged
    })
  }, [])

  const resetPreferences = useCallback(() => {
    writeStoredAppearance(DEFAULT_APPEARANCE)
    applyAppearanceToDocument(DEFAULT_APPEARANCE)
    setResolvedTheme(resolveTheme(DEFAULT_APPEARANCE.theme))
    setPreferencesState(DEFAULT_APPEARANCE)
  }, [])

  const value = useMemo(
    () => ({ preferences, resolvedTheme, setPreferences, resetPreferences }),
    [preferences, resolvedTheme, setPreferences, resetPreferences],
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance() {
  const context = useContext(AppearanceContext)
  if (!context) {
    throw new Error('useAppearance must be used within AppearanceProvider')
  }
  return context
}
