'use client'

import { useRef, type MouseEvent, type RefObject } from 'react'

interface UseMagneticResult {
  ref: RefObject<HTMLAnchorElement | null>
  onMouseMove: (event: MouseEvent<HTMLAnchorElement>) => void
  onMouseLeave: () => void
}

/** Subtle "magnetic" cursor-follow effect for buttons/links. */
export function useMagnetic(strength = 0.35): UseMagneticResult {
  const ref = useRef<HTMLAnchorElement>(null)

  const onMouseMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const node = ref.current
    if (!node) return

    const rect = node.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    node.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }

  const onMouseLeave = () => {
    const node = ref.current
    if (!node) return
    node.style.transform = 'translate(0px, 0px)'
  }

  return { ref, onMouseMove, onMouseLeave }
}
