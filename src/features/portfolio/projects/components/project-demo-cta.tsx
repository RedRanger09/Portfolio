import { Globe } from 'lucide-react'
import { MagneticButton } from '@/shared/components'

interface ProjectDemoCtaProps {
  name: string
  label: string
  href: string
}

/**
 * Closing "open the demo" panel — separate from the header's Live-demo link
 * since it can point at a distinct URL (e.g. a walkthrough video). No card
 * chrome of its own — it's rendered inside `ProjectDetailSection`'s content
 * card, which already provides the border/background.
 */
export function ProjectDemoCta({ name, label, href }: ProjectDemoCtaProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 text-sm text-zinc-500">If the demo is offline, the GitHub repo has setup instructions.</p>
      </div>
      <MagneticButton href={href} variant="secondary" ariaLabel={`Open ${name} demo`}>
        <Globe className="h-4 w-4" aria-hidden="true" />
        Open demo
      </MagneticButton>
    </div>
  )
}
