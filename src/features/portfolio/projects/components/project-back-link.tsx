import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/**
 * Returns to the home page's Projects section (not just "/") — precise
 * navigation back to where the visitor came from, rather than the top of
 * the homepage.
 */
export function ProjectBackLink() {
  return (
    <Link
      href="/#projects"
      className="mb-8 inline-flex items-center gap-2 rounded-full text-sm text-zinc-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/60"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to projects
    </Link>
  )
}
