'use client'

import { motion } from 'framer-motion'
import { ACCENT_CLASSES } from '@/constants/theme'
import { SKILL_GROUP_ICONS } from '../constants/icons'
import { skillPanelReveal } from '../animations/variants'
import { SkillLogo } from './skill-logo'
import type { SkillGroup } from '../types'

interface SkillPanelProps {
  group: SkillGroup
  index: number
}

/** One category panel (e.g. "AI / ML") listing its skill logos. */
export function SkillPanel({ group, index }: SkillPanelProps) {
  const accent = ACCENT_CLASSES[group.accent]
  const Icon = SKILL_GROUP_ICONS[group.icon]

  return (
    <motion.div {...skillPanelReveal(index)} className="rounded-2xl border border-white/[0.08] bg-surface/60 p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${accent.border} ${accent.bg}`}>
          <Icon className={`h-4 w-4 ${accent.text}`} aria-hidden="true" />
        </span>
        <h3 className="text-base font-semibold text-white">{group.title}</h3>
      </div>
      <div className="flex flex-wrap gap-4">
        {group.items.map((item) => (
          <SkillLogo key={item.name} logo={item.logo} name={item.name} />
        ))}
      </div>
      {group.note && <p className="mt-4 text-xs text-zinc-600">{group.note}</p>}
    </motion.div>
  )
}
