'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'
import { cn } from '@/shared/utils'

interface BlogMarkdownProps {
  content: string
  className?: string
}

/**
 * Renders stored markdown for a published article.
 * Links open safely; images use next/image when possible.
 */
export function BlogMarkdown({ content, className }: BlogMarkdownProps) {
  return (
    <div className={cn('blog-prose space-y-5 text-sm leading-8 text-zinc-300 sm:text-base', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h2 className="mt-10 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{children}</h2>,
          h2: ({ children }) => <h2 className="mt-10 text-xl font-semibold tracking-tight text-white sm:text-2xl">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-8 text-lg font-semibold tracking-tight text-white">{children}</h3>,
          h4: ({ children }) => <h4 className="mt-6 text-base font-semibold text-white">{children}</h4>,
          p: ({ children }) => <p className="text-zinc-300">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} className="text-cyan-400 underline-offset-4 hover:underline" target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}>
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc space-y-2 pl-5 text-zinc-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-2 pl-5 text-zinc-300">{children}</ol>,
          li: ({ children }) => <li className="leading-7">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-cyan-500/40 pl-4 text-zinc-400 italic">{children}</blockquote>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isBlock = Boolean(codeClassName)
            if (isBlock) {
              return (
                <code className={cn('font-mono text-sm text-zinc-200', codeClassName)} {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-200" {...props}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/40 p-4 text-sm">{children}</pre>
          ),
          img: ({ src, alt }) => {
            if (typeof src !== 'string' || !src) return null
            const isRemote = src.startsWith('http')
            return (
              <span className="relative my-6 block aspect-[16/10] overflow-hidden rounded-2xl border border-white/[0.08]">
                <Image src={src} alt={alt || ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" unoptimized={!isRemote && src.startsWith('/')} />
              </span>
            )
          },
          hr: () => <hr className="border-white/[0.08]" />,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-zinc-200">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
