import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

function CursorGlow() {
  const shouldReduceMotion = useReducedMotion()
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (shouldReduceMotion) return undefined

    const onMove = (event) => {
      setPos({ x: event.clientX, y: event.clientY })
      setVisible(true)
    }
    const onLeave = () => setVisible(false)

    window.addEventListener('mousemove', onMove, { passive: true })
    document.body.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.body.removeEventListener('mouseleave', onLeave)
    }
  }, [shouldReduceMotion])

  if (shouldReduceMotion || !visible) return null

  return (
    <motion.div
      className="pointer-events-none fixed z-[5] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 120, damping: 28, mass: 0.4 }}
      aria-hidden="true"
    />
  )
}

export default CursorGlow
