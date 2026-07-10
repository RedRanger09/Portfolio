import type { MediaFolderKey } from '../types'

const FOLDER_LABELS: Record<MediaFolderKey, string> = {
  projects: 'Projects',
  certificates: 'Certificates',
  blog: 'Blog',
  resume: 'Resume',
  avatars: 'Avatars',
  hero: 'Hero',
  about: 'About',
}

/** Environment prefix per `database-and-storage.md §2.2`. */
export function getMediaEnvironmentPrefix(): 'prod' | 'preview' | 'dev' {
  const vercelEnv = process.env.VERCEL_ENV

  if (vercelEnv === 'production') return 'prod'
  if (vercelEnv === 'preview') return 'preview'
  return 'dev'
}

/** Resolves `dev/projects`, `prod/certificates`, etc. */
export function resolveMediaFolder(folderKey: MediaFolderKey): string {
  return `${getMediaEnvironmentPrefix()}/${folderKey}`
}

export function getMediaFolderLabel(folderKey: MediaFolderKey): string {
  return FOLDER_LABELS[folderKey]
}

export function listMediaFolderKeys(): MediaFolderKey[] {
  return Object.keys(FOLDER_LABELS) as MediaFolderKey[]
}

/** Parses a stored folder path back to its logical key, if recognized. */
export function parseMediaFolderKey(folderPath: string): MediaFolderKey | null {
  const segment = folderPath.split('/').at(-1)
  if (!segment) return null

  return listMediaFolderKeys().includes(segment as MediaFolderKey) ? (segment as MediaFolderKey) : null
}
