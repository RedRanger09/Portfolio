export type ContactMethodIcon = 'github' | 'linkedin' | 'email' | 'location'

export interface ContactMethod {
  label: string
  value: string
  href: string
  icon: ContactMethodIcon
}

export interface ContactInfo {
  /** Eyebrow label above the section title, e.g. "Contact". */
  label: string
  title: string
  description: string
  methods: ContactMethod[]
  /** Label for the closing call-to-action button. */
  sayHelloLabel: string
  /** `mailto:` href for the closing call-to-action button. */
  sayHelloHref: string
}
