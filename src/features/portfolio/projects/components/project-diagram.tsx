import Image from 'next/image'

interface ProjectDiagramProps {
  src: string
  alt: string
}

/**
 * A full-width diagram image (architecture, RAG pipeline). Uses
 * `object-contain` inside a fixed frame — rather than `object-cover` — so
 * the whole diagram stays legible regardless of its native aspect ratio,
 * since these images vary per project (wide banners, near-square, etc.)
 * unlike the screenshot gallery, which is deliberately cropped.
 */
export function ProjectDiagram({ src, alt }: ProjectDiagramProps) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-background">
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 90vw, 100vw" className="object-contain" />
    </div>
  )
}
