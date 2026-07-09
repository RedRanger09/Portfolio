'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { useActiveSection } from './use-active-section'
import { NavBrand } from './nav-brand'
import { DesktopNav } from './desktop-nav'
import { MobileNavDrawer, MobileNavToggle } from './mobile-nav'

/** Computed once — NAVIGATION_ITEMS is a static module-level constant. */
const SECTION_IDS = NAVIGATION_ITEMS.map((item) => item.id)

/**
 * Sticky, scroll-aware primary navigation.
 *
 * Scroll-driven visuals (padding, blur, background, shadow) are implemented
 * with Framer Motion's `useScroll`/`useTransform` so they update off the React
 * render cycle — no `window.addEventListener('scroll', ...)` re-renders.
 */
export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const activeSection = useActiveSection(SECTION_IDS)

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 40))

  const navPt = useTransform(scrollY, [0, 80], [14, shouldReduceMotion ? 14 : 9])
  const navPb = useTransform(scrollY, [0, 80], [14, shouldReduceMotion ? 14 : 9])
  const pillPadding = useTransform(scrollY, [0, 80], [5, shouldReduceMotion ? 5 : 3])
  const headerBg = useTransform(scrollY, [0, 120], ['rgba(3,3,8,0)', 'rgba(3,3,8,0.86)'])
  const headerBlur = useTransform(scrollY, [0, 120], ['blur(0px) saturate(100%)', 'blur(24px) saturate(160%)'])
  const headerBorderColor = useTransform(scrollY, [0, 120], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.05)'])
  const headerShadow = useTransform(scrollY, [0, 120], ['0 0 0 0 rgba(0,0,0,0)', '0 1px 24px 0 rgba(0,0,0,0.45)'])

  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [])

  return (
    <motion.header
      className="sticky top-0 z-50 border-b"
      style={{
        background: headerBg,
        backdropFilter: headerBlur,
        WebkitBackdropFilter: headerBlur,
        borderColor: headerBorderColor,
        boxShadow: headerShadow,
      }}
    >
      <motion.nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: navPt, paddingBottom: navPb }}
        aria-label="Primary"
      >
        <NavBrand />
        <DesktopNav items={NAVIGATION_ITEMS} activeSection={activeSection} shouldReduceMotion={shouldReduceMotion ?? false} pillPadding={pillPadding} />
        <MobileNavToggle open={open} onToggle={() => setOpen((v) => !v)} shouldReduceMotion={shouldReduceMotion ?? false} />
      </motion.nav>

      <MobileNavDrawer
        open={open}
        scrolled={scrolled}
        shouldReduceMotion={shouldReduceMotion ?? false}
        items={NAVIGATION_ITEMS}
        activeSection={activeSection}
        onNavigate={() => setOpen(false)}
      />
    </motion.header>
  )
}
