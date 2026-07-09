import { footerData } from '../data/portfolioData.js'
import { SITE } from '../constants/site.js'

function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-white">{SITE.name}</p>
          <p className="mt-1 font-mono text-xs text-zinc-500">{SITE.role}</p>
          <p className="mt-2 text-xs text-zinc-600">© 2026 Akshay Tiwari</p>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-zinc-500">{footerData.statement}</p>
      </div>
    </footer>
  )
}

export default Footer
