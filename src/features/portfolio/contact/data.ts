import { SITE } from '@/config/site.config'
import type { ContactInfo } from './types'

const emailHref = 'mailto:' + SITE.email

const contactInfo: ContactInfo = {
  label: 'Contact',
  title: 'Get in touch',
  description: 'Open to internships, research collaborations, and project feedback. Happy to chat about AI, CS, or anything you are building.',
  methods: [
    { label: 'GitHub', value: SITE.social.githubDisplay, href: SITE.social.github, icon: 'github' },
    { label: 'LinkedIn', value: SITE.social.linkedinDisplay, href: SITE.social.linkedin, icon: 'linkedin' },
    { label: 'Email', value: SITE.email, href: emailHref, icon: 'email' },
    { label: 'Location', value: SITE.location, href: '#', icon: 'location' },
  ],
  sayHelloLabel: 'Say hello',
  sayHelloHref: emailHref,
}

export async function getContactInfo(): Promise<ContactInfo> {
  return contactInfo
}
