'use client'

import { useEffect, useState } from 'react'

/**
 * Reactively tracks a CSS media query, e.g. `useMediaQuery('(min-width: 1024px)')`.
 * Returns `false` on the server and during initial hydration to avoid mismatches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    setMatches(mediaQueryList.matches)

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches)
    mediaQueryList.addEventListener('change', listener)
    return () => mediaQueryList.removeEventListener('change', listener)
  }, [query])

  return matches
}
