import type { NavigationItem } from '@/shared/types'

/**
 * Primary navigation — drives the Navbar, mobile menu, and ScrollSpy section IDs.
 * Each `id` must match a `<section id="...">` rendered on the home page.
 * Home is a separate fixed control (`HomeButton`), not a section pill.
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: 'About', href: '/#about', id: 'about' },
  { label: 'Journey', href: '/#journey', id: 'journey' },
  { label: 'Skills', href: '/#skills', id: 'skills' },
  { label: 'Projects', href: '/#projects', id: 'projects' },
  { label: 'Education', href: '/#education', id: 'education' },
  { label: 'Certificates', href: '/#certifications', id: 'certifications' },
  { label: 'Resume', href: '/#resume', id: 'resume' },
  { label: 'Contact', href: '/#contact', id: 'contact' },
]
