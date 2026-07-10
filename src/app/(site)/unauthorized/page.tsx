import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldX } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Unauthorized',
  robots: { index: false, follow: false },
}

/** Shown when a user is signed in but their email is not `ADMIN_EMAIL`. */
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03]">
        <ShieldX className="h-5 w-5 text-pink-400" aria-hidden="true" />
      </span>
      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-pink-400">403</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Access denied</h1>
      <p className="mt-3 max-w-md text-sm text-zinc-500">
        Your account is signed in, but it is not authorized to access the admin dashboard.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-primary/30 bg-gradient-cta px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-gradient-cta-hover focus:outline-none focus:ring-2 focus:ring-primary/70"
      >
        Back to home
      </Link>
    </div>
  )
}
