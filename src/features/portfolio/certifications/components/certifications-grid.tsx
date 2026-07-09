import { CertificationCard } from './certification-card'
import type { Certification } from '../types'

interface CertificationsGridProps {
  certifications: Certification[]
}

/** Grid of every certificate card. Pure layout — no motion of its own. */
export function CertificationsGrid({ certifications }: CertificationsGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {certifications.map((certification, index) => (
        <CertificationCard key={certification.name} certification={certification} index={index} />
      ))}
    </div>
  )
}
