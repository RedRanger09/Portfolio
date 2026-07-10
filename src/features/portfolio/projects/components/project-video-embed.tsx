import { toYouTubeEmbedUrl } from '../lib/youtube'

interface ProjectVideoEmbedProps {
  /** Original YouTube watch/share URL from CMS. */
  url: string
  /** Accessible iframe title. */
  title: string
}

/**
 * Privacy-enhanced YouTube embed. Returns null when the URL is not a
 * recognizable YouTube link so the parent can omit the section entirely.
 */
export function ProjectVideoEmbed({ url, title }: ProjectVideoEmbedProps) {
  const embedUrl = toYouTubeEmbedUrl(url)
  if (!embedUrl) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40">
      <div className="relative aspect-video w-full">
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  )
}
