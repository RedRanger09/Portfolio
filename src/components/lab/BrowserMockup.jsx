import { motion, useReducedMotion } from 'framer-motion'

function BrowserMockup({ src, alt, title = 'project preview', className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={`overflow-hidden rounded-2xl border border-white/[0.08] bg-surface shadow-card ${className}`}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-background px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 truncate font-mono text-[0.65rem] text-zinc-500">{title}</span>
      </div>
      <motion.div className="overflow-hidden bg-background" whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }} transition={{ duration: 0.4 }}>
        <img src={src} alt={alt} className="aspect-video w-full object-cover object-top" loading="lazy" />
      </motion.div>
    </motion.div>
  )
}

export default BrowserMockup
