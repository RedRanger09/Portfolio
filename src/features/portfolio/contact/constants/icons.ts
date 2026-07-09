import { GitBranch, BriefcaseBusiness, Mail, MapPin, type LucideIcon } from 'lucide-react'
import type { ContactMethodIcon } from '../types'

export const CONTACT_METHOD_ICONS: Record<ContactMethodIcon, LucideIcon> = {
  github: GitBranch,
  linkedin: BriefcaseBusiness,
  email: Mail,
  location: MapPin,
}

/**
 * Per-method icon accent classes. Kept separate from `constants/theme.ts`'s
 * `AccentColor` system because these are fixed brand/semantic colors tied to
 * the method type (e.g. LinkedIn's brand blue), not one of the app's five
 * interchangeable section accents.
 */
export const CONTACT_METHOD_ICON_CLASSES: Record<ContactMethodIcon, string> = {
  github: 'text-white bg-zinc-800 border-zinc-700',
  linkedin: 'text-[#0A66C2] bg-[#0A66C2]/10 border-[#0A66C2]/25',
  email: 'text-amber-400 bg-amber-400/10 border-amber-500/25',
  location: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/25',
}
