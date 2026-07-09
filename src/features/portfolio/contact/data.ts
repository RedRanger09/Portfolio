import { SITE } from '@/config/site.config'
import type { ContactInfo, GithubActivity, SocialLink } from './types'

const contactInfo: ContactInfo = {
  title: 'Get in touch',
  description: 'Open to internships, research collaborations, and project feedback. Happy to chat about AI, CS, or anything you are building.',
  methods: [
    { label: 'GitHub', value: SITE.social.githubDisplay, href: SITE.social.github, icon: 'github' },
    { label: 'LinkedIn', value: SITE.social.linkedinDisplay, href: SITE.social.linkedin, icon: 'linkedin' },
    { label: 'Email', value: SITE.email, href: 'mailto:' + SITE.email, icon: 'email' },
    { label: 'Location', value: SITE.location, href: '#', icon: 'location' },
  ],
}

// Unused by any current component — see SocialLink/GithubActivity remarks in ./types.
const socials: SocialLink[] = [
  { id: 'github', label: 'GitHub', href: SITE.social.github, icon: 'github' },
  { id: 'linkedin', label: 'LinkedIn', href: SITE.social.linkedin, icon: 'linkedin' },
  { id: 'email', label: 'Email', href: 'mailto:' + SITE.email, icon: 'email' },
  { id: 'resume', label: 'Resume', href: SITE.resumePath, icon: 'resume', download: true },
]

const githubActivity: GithubActivity = {
  username: 'Akshay6601',
  profileUrl: SITE.social.github,
  pinnedNote: 'Pinned repos and contribution graph — connect your GitHub username to show live data.',
}

export async function getContactInfo(): Promise<ContactInfo> {
  return contactInfo
}

export async function getSocials(): Promise<SocialLink[]> {
  return socials
}

export async function getGithubActivity(): Promise<GithubActivity> {
  return githubActivity
}
