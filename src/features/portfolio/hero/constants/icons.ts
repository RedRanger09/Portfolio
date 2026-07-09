import { Brain, BriefcaseBusiness, Code2, Download, FolderKanban, GitBranch, GraduationCap, type LucideIcon } from 'lucide-react'
import type { HeroCtaIcon, HeroInterestIcon } from '../types'

/** Icon lookups keyed by the data layer's icon fields — keeps `data.ts` free of component imports. */
export const HERO_CTA_ICONS: Record<HeroCtaIcon, LucideIcon> = {
  FolderKanban,
  Download,
  GitBranch,
  BriefcaseBusiness,
}

export const HERO_INTEREST_ICONS: Record<HeroInterestIcon, LucideIcon> = {
  GraduationCap,
  Code2,
  Brain,
}
