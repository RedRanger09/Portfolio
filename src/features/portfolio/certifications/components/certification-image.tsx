import Image from 'next/image'

interface CertificationImageProps {
  src: string
  alt: string
}

/** Certificate thumbnail with a bottom gradient for caption legibility. Hover zoom is pure CSS. */
export function CertificationImage({ src, alt }: CertificationImageProps) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  )
}
