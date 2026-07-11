'use client'

import { motion } from 'framer-motion'
import { getSimpleIconUrl } from '@/constants/tech-logos'
import { certificationCardReveal } from '../animations/variants'
import { CertificationImage } from './certification-image'
import { CertificationLinks } from './certification-links'
import type { Certification } from '../types'

interface CertificationCardProps {
  certification: Certification
  index: number
}

/** One certificate card: thumbnail, provider, completion date, and verification links. */
export function CertificationCard({ certification, index }: CertificationCardProps) {
  return (
    <motion.figure
      {...certificationCardReveal(index)}
      className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-surface transition-shadow hover:shadow-[0_12px_48px_rgba(0,0,0,0.5)]"
    >
      <CertificationImage src={certification.image} alt={certification.name} />
      <figcaption className="p-4">
        <p className="text-sm font-semibold text-white">{certification.name}</p>
        <div className="mt-1 flex items-center gap-1.5">
          {certification.providerLogo && (
            // eslint-disable-next-line @next/next/no-img-element -- remote Simple Icons CDN SVG
            <img
              src={getSimpleIconUrl(certification.providerLogo)}
              alt=""
              width={13}
              height={13}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          <p className="text-xs text-zinc-500">{certification.provider}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {certification.completionDate && certification.completionDate !== '—' && (
            <span className="rounded-full border border-white/[0.08] px-3 py-1 text-[0.7rem] text-zinc-500">
              {certification.completionDate}
            </span>
          )}
          <CertificationLinks
            name={certification.name}
            credentialUrl={certification.credentialUrl}
            verifyUrl={certification.verifyUrl}
          />
        </div>
      </figcaption>
    </motion.figure>
  )
}
