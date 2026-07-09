'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Fades + slides in every element matching `selector` as it scrolls into view. */
export function useGsapReveal(enabled = true, selector = '[data-lab-reveal]') {
  const scopeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled) return undefined

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 32,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
      })
    }, scopeRef)

    return () => ctx.revert()
  }, [enabled, selector])

  return scopeRef
}
