import { User, Map, Wrench, FolderOpen, GraduationCap, BadgeCheck, FileText, BookOpen, Mail, type LucideIcon } from 'lucide-react'
import type { SectionId } from '@/shared/types'

/** Icon shown beside each nav label — keyed by section id or route label. */
export const NAV_ICONS: Partial<Record<SectionId | 'blog', LucideIcon>> = {
  about: User,
  journey: Map,
  skills: Wrench,
  projects: FolderOpen,
  education: GraduationCap,
  certifications: BadgeCheck,
  resume: FileText,
  blog: BookOpen,
  contact: Mail,
}
