function MockWindow({ title, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-background shadow-card">
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-surface px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 font-mono text-xs text-zinc-500">{title}</span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

export default MockWindow
