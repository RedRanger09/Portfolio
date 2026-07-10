/**
 * Safe YouTube URL parsing for case-study embeds.
 * Accepts youtube.com/watch, youtube.com/embed, and youtu.be forms.
 * Returns a canonical embed URL or null when the input is empty/invalid.
 */

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'])

export function extractYouTubeVideoId(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.toLowerCase()
  if (!YOUTUBE_HOSTS.has(host)) return null

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0]
    return isValidYouTubeId(id) ? id : null
  }

  if (url.pathname.startsWith('/embed/')) {
    const id = url.pathname.slice('/embed/'.length).split('/')[0]
    return isValidYouTubeId(id) ? id : null
  }

  if (url.pathname.startsWith('/shorts/')) {
    const id = url.pathname.slice('/shorts/'.length).split('/')[0]
    return isValidYouTubeId(id) ? id : null
  }

  const fromQuery = url.searchParams.get('v')
  return isValidYouTubeId(fromQuery) ? fromQuery : null
}

function isValidYouTubeId(id: string | null | undefined): id is string {
  return typeof id === 'string' && /^[\w-]{11}$/.test(id)
}

/** Canonical privacy-friendly embed URL, or null when not a YouTube link. */
export function toYouTubeEmbedUrl(raw: string): string | null {
  const id = extractYouTubeVideoId(raw)
  if (!id) return null
  return `https://www.youtube-nocookie.com/embed/${id}`
}

export function isYouTubeUrl(raw: string): boolean {
  return extractYouTubeVideoId(raw) !== null
}
