import { useEffect, useRef, useState } from 'react'

/**
 * ScrollSpy hook — returns the ID of the section currently visible
 * in the viewport's "reading zone", updated in real time.
 *
 * Root cause handled:
 *   Sections may not be in the DOM yet when the Navbar first mounts
 *   (they render only after a loading sequence). Phase 1 polls until
 *   every section element exists, then Phase 2 attaches the observer.
 *
 * Algorithm:
 *   - Maintain a Set of currently-intersecting section IDs.
 *   - On each IntersectionObserver callback, add/remove IDs.
 *   - Pick the first ID in original sectionIds order (= topmost on page).
 *
 * rootMargin: '-15% 0px -45% 0px'
 *   Creates a 40% reading zone from 15% to 60% of the viewport height.
 *   A section is "active" while any part of it occupies this band.
 *   threshold: 0 fires immediately on any pixel entering/leaving the band.
 *
 * NOTE: threshold > 0.1 breaks on sections taller than the viewport
 *   because intersectionRatio = visibleHeight / totalHeight, which
 *   can never exceed ~0.4 for a 2× viewport-height section.
 *   Always use threshold: 0 for scroll-spy purposes.
 */
function useActiveSection(sectionIds) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] || '')
  const [domReady, setDomReady]           = useState(false)
  const visibleSet                         = useRef(new Set())

  /* ── Phase 1: wait until every section element exists in the DOM ── */
  useEffect(() => {
    if (!sectionIds.length) return

    let rafId = null
    let attempts = 0
    const MAX_ATTEMPTS = 80 // ~8 s at 100 ms intervals

    const check = () => {
      const allFound = sectionIds.every((id) => document.getElementById(id) !== null)
      if (allFound) {
        setDomReady(true)
        return
      }
      if (++attempts < MAX_ATTEMPTS) {
        rafId = setTimeout(check, 100)
      }
    }

    check()

    return () => {
      if (rafId) clearTimeout(rafId)
    }
  }, [sectionIds])

  /* ── Phase 2: attach IntersectionObserver once DOM is ready ── */
  useEffect(() => {
    if (!domReady || !sectionIds.length) return

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (!elements.length) return

    const pickTopmost = () => {
      for (const id of sectionIds) {
        if (visibleSet.current.has(id)) {
          setActiveSection(id)
          return
        }
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSet.current.add(entry.target.id)
          } else {
            visibleSet.current.delete(entry.target.id)
          }
        })
        pickTopmost()
      },
      {
        /*
         * Reading zone: 15% from top → 60% from top (a 45% band).
         * -15% crops the top so the hero doesn't steal "about".
         * -40% crops the bottom so only the section being read wins.
         */
        rootMargin: '-15% 0px -40% 0px',
        threshold: 0,
      },
    )

    elements.forEach((el) => observer.observe(el))

    // Run once to seed the initial active state
    pickTopmost()

    const set = visibleSet.current
    return () => {
      observer.disconnect()
      set.clear()
    }
  }, [sectionIds, domReady])

  return activeSection
}

export default useActiveSection
