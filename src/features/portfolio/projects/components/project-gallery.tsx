import Image from 'next/image'
import type { ProjectGalleryItem } from '../types'

interface ProjectGalleryProps {
  items: ProjectGalleryItem[]
}

/** Additional screenshots beyond the main preview, cropped to a consistent 16:9 frame. Returns null if there's nothing to show. */
export function ProjectGallery({ items }: ProjectGalleryProps) {
  if (items.length === 0) return null

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((item) => (
        <figure key={item.caption} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-surface">
          <div className="relative aspect-video w-full">
            <Image src={item.src} alt={item.caption} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <figcaption className="p-4 text-sm text-zinc-400">{item.caption}</figcaption>
        </figure>
      ))}
    </div>
  )
}
