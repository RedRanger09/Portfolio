function ArchDiagram({ steps, variant = 'flow' }) {
  if (variant === 'radial') {
    return (
      <div className="relative mx-auto aspect-square max-w-xs">
        {steps.map((step, index) => {
          const angle = (index / steps.length) * Math.PI * 2 - Math.PI / 2
          const x = 50 + Math.cos(angle) * 38
          const y = 50 + Math.sin(angle) * 38
          return (
            <div
              key={step}
              className="absolute w-24 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-primary/20 bg-surface px-2 py-2 text-center font-mono text-[0.6rem] leading-tight text-zinc-300"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {step}
            </div>
          )
        })}
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30 bg-gradient-highlight" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={step} className="flex items-start gap-3">
          <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 font-mono text-[0.65rem] text-primary">
            {index + 1}
          </span>
          <p className="text-sm leading-6 text-zinc-400">{step}</p>
        </div>
      ))}
    </div>
  )
}

export default ArchDiagram
