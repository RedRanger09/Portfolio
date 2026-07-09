'use client'

import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { MagneticButton } from '@/shared/components'
import { contactCtaReveal } from '../animations/variants'

interface ContactCtaProps {
  href: string
  label: string
}

/** Closing "Say hello" call-to-action beneath the contact method grid. */
export function ContactCta({ href, label }: ContactCtaProps) {
  return (
    <motion.div {...contactCtaReveal} className="mt-10 text-center">
      <MagneticButton href={href} variant="primary" ariaLabel={label}>
        <Mail className="h-4 w-4" aria-hidden="true" />
        {label}
      </MagneticButton>
    </motion.div>
  )
}
