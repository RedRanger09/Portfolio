import { User, Map, Wrench, FolderOpen, GraduationCap, BadgeCheck, FileText, Mail, type LucideIcon } from 'lucide-react'
import type { SectionId } from '@/shared/types'

/** Icon shown beside each nav label — keyed by section id, not by label text. */
export const NAV_ICONS: Partial<Record<SectionId, LucideIcon>> = {
  about: User,
  journey: Map,
  skills: Wrench,
  projects: FolderOpen,
  education: GraduationCap,
  certifications: BadgeCheck,
  resume: FileText,
  contact: Mail,
}
