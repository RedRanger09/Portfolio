'use client'

import { Download, Eye, Maximize2 } from 'lucide-react'

interface ResumeActionsProps {
  filePath: string
}

/** Preview / Download / Fullscreen row. Client only for the Fullscreen button's click handler. */
export function ResumeActions({ filePath }: ResumeActionsProps) {
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <a
        href={filePath}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-surface/80 px-5 py-2.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
      >
        <Eye className="h-4 w-4 text-amber-400" aria-hidden="true" />
        Preview
      </a>
      <a
        href={filePath}
        download
        className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:from-indigo-500 hover:to-violet-500"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Download
      </a>
      <button
        type="button"
        onClick={() => window.open(filePath, '_blank')}
        className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-surface/80 px-5 py-2.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
      >
        <Maximize2 className="h-4 w-4 text-cyan-400" aria-hidden="true" />
        Fullscreen
      </button>
    </div>
  )
}
