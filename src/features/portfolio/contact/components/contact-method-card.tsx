'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { CONTACT_METHOD_ICONS, CONTACT_METHOD_ICON_CLASSES } from '../constants/icons'
import { contactMethodReveal } from '../animations/variants'
import type { ContactMethod } from '../types'

interface ContactMethodCardProps {
  method: ContactMethod
  index: number
}

const CARD_CLASSES =
  'group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-surface/60 px-5 py-4 transition-all duration-200 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-surface hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]'

/** One contact method card — renders as a link when it has a real `href`, otherwise a static card (e.g. Location). */
export function ContactMethodCard({ method, index }: ContactMethodCardProps) {
  const Icon = CONTACT_METHOD_ICONS[method.icon]
  const iconAccent = CONTACT_METHOD_ICON_CLASSES[method.icon]
  const isLink = Boolean(method.href) && method.href !== '#'
  const isExternal = isLink && method.href.startsWith('http')

  const body = (
    <>
      <span
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-110 ${iconAccent}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-500">{method.label}</p>
        <p className="truncate text-sm font-medium text-white">{method.value}</p>
      </div>
      {isLink && <ExternalLink className="h-4 w-4 shrink-0 text-zinc-700 transition group-hover:text-zinc-400" aria-hidden="true" />}
    </>
  )

  return (
    <motion.div {...contactMethodReveal(index)}>
      {isLink ? (
        <a
          href={method.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer' : undefined}
          aria-label={`${method.label}: ${method.value}`}
          className={CARD_CLASSES}
        >
          {body}
        </a>
      ) : (
        <div className={CARD_CLASSES}>{body}</div>
      )}
    </motion.div>
  )
}
