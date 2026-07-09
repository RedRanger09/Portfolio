import { JourneyIconNode } from './journey-icon-node'
import { JourneyCard } from './journey-card'
import type { JourneyStep } from '../types'

interface JourneyTimelineProps {
  steps: JourneyStep[]
}

/**
 * Splits the milestones into two columns and lays out each as an
 * icon-node + card pair connected by a vertical line. Pure layout — no
 * motion of its own, so it stays a Server Component even though its
 * children (`JourneyIconNode`, `JourneyCard`) are client.
 */
export function JourneyTimeline({ steps }: JourneyTimelineProps) {
  const half = Math.ceil(steps.length / 2)
  const columns = [steps.slice(0, half), steps.slice(half)]

  return (
    <div className="grid gap-x-16 lg:grid-cols-2">
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className={columnIndex === 1 ? 'mt-6 lg:mt-0' : undefined}>
          {column.map((step, index) => (
            <div key={step.id} className="relative flex gap-4 sm:gap-6">
              {index !== column.length - 1 && (
                <div
                  className="absolute left-[1.4rem] top-12 bottom-0 w-px sm:left-[1.65rem]"
                  style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.4), rgba(139,92,246,0.1))' }}
                  aria-hidden="true"
                />
              )}
              <JourneyIconNode step={step} index={index} />
              <JourneyCard step={step} index={index} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
