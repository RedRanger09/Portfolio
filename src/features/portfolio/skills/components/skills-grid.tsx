import { SkillPanel } from './skill-panel'
import type { SkillGroup } from '../types'

interface SkillsGridProps {
  groups: SkillGroup[]
}

/** Grid of every skill category panel. Pure layout — no motion of its own. */
export function SkillsGrid({ groups }: SkillsGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group, index) => (
        <SkillPanel key={group.title} group={group} index={index} />
      ))}
    </div>
  )
}
