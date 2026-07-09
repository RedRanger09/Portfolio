import { ArrowRight, GitBranch } from 'lucide-react'

interface ProjectLinksProps {
  name: string
  caseStudy: string
  github: string
  isPlaceholder?: boolean
}

/** Compact "Details" / "GitHub" text links shown on a grid card. Plain anchors — no motion. */
export function ProjectLinks({ name, caseStudy, github, isPlaceholder }: ProjectLinksProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {!isPlaceholder && caseStudy && (
        <a
          href={caseStudy}
          aria-label={`View case study for ${name}`}
          className="inline-flex items-center gap-1.5 text-sm text-cyan-400 transition hover:text-cyan-300"
        >
          Details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      )}
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noreferrer"
          aria-label={`View ${name} on GitHub`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-white"
        >
          <GitBranch className="h-3.5 w-3.5" aria-hidden="true" /> GitHub
        </a>
      )}
    </div>
  )
}
