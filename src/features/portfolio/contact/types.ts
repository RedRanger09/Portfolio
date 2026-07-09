export type ContactMethodIcon = 'github' | 'linkedin' | 'email' | 'location'

export interface ContactMethod {
  label: string
  value: string
  href: string
  icon: ContactMethodIcon
}

export interface ContactInfo {
  title: string
  description: string
  methods: ContactMethod[]
}

/**
 * @remarks Not currently rendered anywhere (no "connect" widget exists yet).
 * Kept typed and available for Phase 3 — decide then whether to wire it into
 * a social-links component or remove it.
 */
export interface SocialLink {
  id: string
  label: string
  href: string
  icon: string
  download?: boolean
}

/**
 * @remarks Not currently rendered anywhere — the GitHub-activity section was
 * removed from the live UI. Kept typed as a decision point for Phase 3
 * (revive as a small contribution-graph widget, or delete).
 */
export interface GithubActivity {
  username: string
  profileUrl: string
  pinnedNote: string
}
