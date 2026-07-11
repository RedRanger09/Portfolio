import type { NavigationItem } from '@/shared/types'

/**
 * Primary navigation — drives the Navbar, mobile menu, and ScrollSpy section IDs.
 * Items with `id` must match a `<section id="...">` on the home page.
 * Route-only items (no `id`) navigate away from the homepage (e.g. Blog).
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: 'About', href: '/#about', id: 'about' },
  { label: 'Journey', href: '/#journey', id: 'journey' },
  { label: 'Skills', href: '/#skills', id: 'skills' },
  { label: 'Projects', href: '/#projects', id: 'projects' },
  { label: 'Education', href: '/#education', id: 'education' },
  { label: 'Certificates', href: '/#certifications', id: 'certifications' },
  { label: 'Resume', href: '/#resume', id: 'resume' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/#contact', id: 'contact' },
]
