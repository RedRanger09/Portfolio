import {
  Award,
  BarChart3,
  Bot,
  Code2,
  FileText,
  FolderKanban,
  GraduationCap,
  Image,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Newspaper,
  Route,
  Rocket,
  Settings,
  UserCircle,
  type LucideIcon,
} from 'lucide-react'

export interface AdminNavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface AdminNavGroup {
  /** Omit for the ungrouped leading item (Dashboard) — a lone group heading of "Overview" would add noise for one link. */
  label?: string
  items: AdminNavItem[]
}

/**
 * The admin sidebar's full navigation tree — grouped for scannability,
 * but every route from the brief is present in the same relative order
 * (Dashboard, Projects, Hero, About, Journey, Skills, Education,
 * Certificates, Resume, Contact, Media, Blog, Messages, Analytics, AI,
 * Settings). `/admin/certifications` (not `/admin/certificates`) matches
 * the existing `features/portfolio/certifications` naming; only the
 * sidebar *label* says "Certificates", mirroring the public Navbar
 * (`constants/navigation.ts`) doing the same thing for the same reason.
 *
 * Flat, not derived from `NAVIGATION_ITEMS` — the public nav is a set of
 * in-page anchors for a one-page marketing site; this is a set of real
 * routes for a multi-page admin app. Forcing one shared source of truth
 * between two conceptually different navigation structures would create
 * a coupling that breaks the moment either one changes for its own reasons.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    label: 'Portfolio',
    items: [
      { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
      { label: 'Hero', href: '/admin/hero', icon: Rocket },
      { label: 'About', href: '/admin/about', icon: UserCircle },
      { label: 'Journey', href: '/admin/journey', icon: Route },
      { label: 'Skills', href: '/admin/skills', icon: Code2 },
      { label: 'Education', href: '/admin/education', icon: GraduationCap },
      { label: 'Certificates', href: '/admin/certifications', icon: Award },
      { label: 'Resume', href: '/admin/resume', icon: FileText },
      { label: 'Contact', href: '/admin/contact', icon: Mail },
    ],
  },
  {
    label: 'Content & engagement',
    items: [
      { label: 'Media', href: '/admin/media', icon: Image },
      { label: 'Blog', href: '/admin/blog', icon: Newspaper },
      { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'AI', href: '/admin/ai', icon: Bot },
    ],
  },
  {
    label: 'System',
    items: [{ label: 'Settings', href: '/admin/settings', icon: Settings }],
  },
]

/** Flattened view — used wherever a lookup by path matters more than grouping (breadcrumbs, active-state matching). */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items)

/**
 * Shared active-link rule for the sidebar and mobile drawer: `/admin`
 * only matches the dashboard exactly (otherwise every module page would
 * highlight it too, since they're all nested under `/admin/*`); every
 * other item also matches its own future subroutes (e.g. a later
 * `/admin/projects/new` should still highlight "Projects").
 */
export function isAdminNavItemActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}
