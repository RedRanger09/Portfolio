'use client'

import { useEffect, useState } from 'react'

interface ParallaxOffset {
  x: number
  y: number
}

/** Tracks normalized cursor offset from viewport center, scaled by `intensity`. */
export function useMouseParallax(intensity = 1): ParallaxOffset {
  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (event: globalThis.MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * intensity
      const y = (event.clientY / window.innerHeight - 0.5) * intensity
      setOffset({ x, y })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [intensity])

  return offset
}
