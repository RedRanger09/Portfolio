import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm text-zinc-500">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-primary/30 bg-gradient-cta px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-gradient-cta-hover focus:outline-none focus:ring-2 focus:ring-primary/70"
      >
        Back to home
      </Link>
    </div>
  )
}
