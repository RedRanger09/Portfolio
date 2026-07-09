import Image from 'next/image'

interface ProjectImageProps {
  src: string
  alt: string
  isPlaceholder?: boolean
  comingSoonLabel: string
}

/**
 * Grid card thumbnail. The hover zoom (`group-hover:scale-105`) is pure CSS,
 * driven by the `group` class on the parent card — no Framer Motion needed,
 * so this stays a plain Server Component even though its parent is a client
 * component.
 */
export function ProjectImage({ src, alt, isPlaceholder, comingSoonLabel }: ProjectImageProps) {
  return (
    <div className="relative aspect-video overflow-hidden border-b border-white/[0.06]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {isPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80">
          <p className="text-xs text-zinc-500">{comingSoonLabel}</p>
        </div>
      )}
    </div>
  )
}
