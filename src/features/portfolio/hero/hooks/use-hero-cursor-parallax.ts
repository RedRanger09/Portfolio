'use client'

import { useCallback, useRef, type MouseEvent } from 'react'
import { useMotionValue, type MotionValue } from 'framer-motion'

interface UseHeroCursorParallaxResult {
  containerRef: React.RefObject<HTMLDivElement | null>
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  onMouseMove: (event: MouseEvent<HTMLDivElement>) => void
  onMouseLeave: () => void
}

/**
 * Tracks cursor position normalized to [-0.5, 0.5] relative to a container's
 * center, exposed as Framer Motion values so consumers (`useTransform`) can
 * derive parallax offsets without triggering React re-renders on every
 * mousemove — the values flow straight into the DOM via Framer Motion.
 *
 * Container-scoped and Motion-value-based, which is why this isn't
 * `shared/hooks/use-mouse-parallax` (that one tracks the whole viewport with
 * plain React state) — different contract, different consumer.
 */
export function useHeroCursorParallax(shouldReduceMotion: boolean): UseHeroCursorParallaxResult {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const onMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (shouldReduceMotion) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      mouseX.set((event.clientX - rect.left - rect.width / 2) / rect.width)
      mouseY.set((event.clientY - rect.top - rect.height / 2) / rect.height)
    },
    [mouseX, mouseY, shouldReduceMotion],
  )

  const onMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  return { containerRef, mouseX, mouseY, onMouseMove, onMouseLeave }
}
