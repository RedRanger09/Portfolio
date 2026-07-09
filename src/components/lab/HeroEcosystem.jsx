import { motion, useReducedMotion } from 'framer-motion'
import { Brain, Database, Cpu, Network, Sparkles, Bot } from 'lucide-react'
import useMouseParallax from '../../hooks/useMouseParallax.js'

const nodes = [
  { id: 'llm', label: 'LLMs', icon: Brain, x: 50, y: 18, color: '#6366F1' },
  { id: 'rag', label: 'RAG', icon: Database, x: 82, y: 42, color: '#8B5CF6' },
  { id: 'agents', label: 'Agents', icon: Bot, x: 72, y: 78, color: '#22D3EE' },
  { id: 'infer', label: 'Inference', icon: Cpu, x: 28, y: 72, color: '#6366F1' },
  { id: 'search', label: 'Vectors', icon: Network, x: 18, y: 38, color: '#8B5CF6' },
  { id: 'core', label: 'Core', icon: Sparkles, x: 50, y: 50, color: '#22D3EE' },
]

const edges = [
  ['core', 'llm'],
  ['core', 'rag'],
  ['core', 'agents'],
  ['core', 'infer'],
  ['core', 'search'],
  ['llm', 'rag'],
  ['rag', 'search'],
  ['agents', 'infer'],
]

function HeroEcosystem() {
  const shouldReduceMotion = useReducedMotion()
  const parallax = useMouseParallax(24)

  const nodeMap = Object.fromEntries(nodes.map((node) => [node.id, node]))

  return (
    <div className="relative aspect-square w-full max-w-xl lg:max-w-none">
      <motion.div
        className="absolute inset-0 rounded-[2rem] bg-gradient-hero opacity-90"
        animate={shouldReduceMotion ? false : { backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{ translateX: parallax.x, translateY: parallax.y }}
      />
      <div className="absolute inset-0 rounded-[2rem] border border-white/[0.08] bg-background/40 backdrop-blur-sm" />

      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full p-8" aria-hidden="true">
        {edges.map(([from, to]) => {
          const a = nodeMap[from]
          const b = nodeMap[to]
          return (
            <motion.line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="url(#lineGrad)"
              strokeWidth="0.35"
              initial={{ pathLength: 0, opacity: 0.2 }}
              animate={{ pathLength: 1, opacity: [0.25, 0.7, 0.25] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )
        })}
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>

      {nodes.map((node, index) => {
        const Icon = node.icon
        return (
          <motion.div
            key={node.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            animate={
              shouldReduceMotion
                ? false
                : { y: [0, index % 2 === 0 ? -6 : 6, 0] }
            }
            transition={{ duration: 4 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-surface shadow-glow-accent sm:h-12 sm:w-12"
              style={{ boxShadow: `0 0 24px ${node.color}33` }}
            >
              <Icon className="h-5 w-5" style={{ color: node.color }} />
            </div>
            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-zinc-400">{node.label}</span>
          </motion.div>
        )
      })}

      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/[0.08] bg-surface/80 px-4 py-3 font-mono text-[0.65rem] text-zinc-500 backdrop-blur-md sm:text-xs">
        <span className="text-accent">●</span> ecosystem online — retrieval, inference, orchestration synced
      </div>
    </div>
  )
}

export default HeroEcosystem
