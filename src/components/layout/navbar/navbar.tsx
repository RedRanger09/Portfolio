'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { useAppearance } from '@/features/appearance'
import { useActiveSection } from './use-active-section'
import { DesktopNav } from './desktop-nav'
import { MobileNavDrawer, MobileNavToggle } from './mobile-nav'

/** Computed once — only homepage section links participate in ScrollSpy. */
const SECTION_IDS = NAVIGATION_ITEMS.map((item) => item.id).filter((id): id is NonNullable<typeof id> => Boolean(id))

/**
 * Sticky, scroll-aware primary navigation.
 * Home + Appearance float independently at the viewport corners;
 * this bar keeps section pills centered with the mobile menu on the right.
 */
export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const activeSection = useActiveSection(SECTION_IDS)
  const { resolvedTheme } = useAppearance()
  const isLight = resolvedTheme === 'light'

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 40))

  const navPt = useTransform(scrollY, [0, 80], [12, shouldReduceMotion ? 12 : 8])
  const navPb = useTransform(scrollY, [0, 80], [12, shouldReduceMotion ? 12 : 8])
  const pillPadding = useTransform(scrollY, [0, 80], [5, shouldReduceMotion ? 5 : 3])
  const headerBgDark = useTransform(scrollY, [0, 120], ['rgba(3,3,8,0)', 'rgba(3,3,8,0.86)'])
  const headerBgLight = useTransform(scrollY, [0, 120], ['rgba(244,244,245,0)', 'rgba(244,244,245,0.92)'])
  const headerBlur = useTransform(scrollY, [0, 120], ['blur(0px) saturate(100%)', 'blur(24px) saturate(160%)'])
  const headerBorderDark = useTransform(scrollY, [0, 120], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.05)'])
  const headerBorderLight = useTransform(scrollY, [0, 120], ['rgba(24,24,27,0)', 'rgba(24,24,27,0.08)'])
  const headerShadowDark = useTransform(scrollY, [0, 120], ['0 0 0 0 rgba(0,0,0,0)', '0 1px 24px 0 rgba(0,0,0,0.45)'])
  const headerShadowLight = useTransform(scrollY, [0, 120], ['0 0 0 0 rgba(0,0,0,0)', '0 1px 24px 0 rgba(24,24,27,0.08)'])
  const headerBg = isLight ? headerBgLight : headerBgDark
  const headerBorderColor = isLight ? headerBorderLight : headerBorderDark
  const headerShadow = isLight ? headerShadowLight : headerShadowDark

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
        className="relative mx-auto flex max-w-6xl items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: navPt, paddingBottom: navPb }}
        aria-label="Primary"
      >
        {/* Corner spacers keep the pill optically centered between floating Home / Appearance. */}
        <div className="pointer-events-none absolute inset-y-0 left-4 w-[5.75rem] sm:left-6 sm:w-[6.5rem] lg:left-8" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-4 w-[5.75rem] sm:right-6 sm:w-[8.5rem] lg:right-8" aria-hidden="true" />

        <DesktopNav items={NAVIGATION_ITEMS} activeSection={activeSection} shouldReduceMotion={shouldReduceMotion ?? false} pillPadding={pillPadding} />

        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center sm:right-6 lg:right-8">
          <div className="mr-[4.5rem] sm:mr-[7.25rem]">
            <MobileNavToggle open={open} onToggle={() => setOpen((v) => !v)} shouldReduceMotion={shouldReduceMotion ?? false} />
          </div>
        </div>
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
