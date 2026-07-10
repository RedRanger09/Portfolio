interface SkipToContentLinkProps {
  targetId: string
}

/** Visually hidden until focused — lets keyboard/screen-reader users bypass the nav. */
export function SkipToContentLink({ targetId }: SkipToContentLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-16 focus:z-[70] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
    >
      Skip to content
    </a>
  )
}
