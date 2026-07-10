import Image from 'next/image'
import type { ProjectGalleryItem } from '../types'

interface ProjectGalleryProps {
  items: ProjectGalleryItem[]
}

/** Additional screenshots beyond the main preview, cropped to a consistent 16:9 frame. */
export function ProjectGallery({ items }: ProjectGalleryProps) {
  if (items.length === 0) return null

  return (
    <div className="grid gap-6 md:grid-cols-2" role="list" aria-label="Project screenshots">
      {items.map((item, index) => {
        const alt = item.altText || item.caption || `Screenshot ${index + 1}`
        const key = item.id ?? `${item.src}-${index}`

        return (
          <figure key={key} role="listitem" className="overflow-hidden rounded-2xl border border-white/[0.08] bg-surface">
            <div className="relative aspect-video w-full">
              <Image
                src={item.src}
                alt={alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                unoptimized={item.src.startsWith('/')}
              />
            </div>
            {item.caption ? <figcaption className="p-4 text-sm text-zinc-400">{item.caption}</figcaption> : null}
          </figure>
        )
      })}
    </div>
  )
}
