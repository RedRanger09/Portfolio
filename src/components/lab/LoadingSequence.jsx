import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const steps = ['Loading portfolio', 'Almost there', 'Welcome']

function LoadingSequence({ onComplete }) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timers = steps.map((_, index) =>
      setTimeout(() => setStep(index), index * 380),
    )
    const finish = setTimeout(() => {
      setDone(true)
      onComplete?.()
    }, steps.length * 380 + 280)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(finish)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="w-full max-w-sm px-6 text-center">
            <p className="font-mono text-xs tracking-widest text-cyan-400">Portfolio</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Akshay Tiwari</h2>
            <div className="mx-auto mt-8 h-px w-full max-w-xs overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400"
                initial={{ width: '0%' }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <p className="mt-4 text-sm text-zinc-500">{steps[step]}…</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingSequence
