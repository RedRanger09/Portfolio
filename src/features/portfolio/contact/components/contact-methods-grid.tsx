import { ContactMethodCard } from './contact-method-card'
import type { ContactMethod } from '../types'

interface ContactMethodsGridProps {
  methods: ContactMethod[]
}

/** Grid of every contact method card. Pure layout — no motion of its own. */
export function ContactMethodsGrid({ methods }: ContactMethodsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {methods.map((method, index) => (
        <ContactMethodCard key={method.label} method={method} index={index} />
      ))}
    </div>
  )
}
