import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPostForAdminById } from '@/features/admin/blog'

interface BlogPreviewPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: BlogPreviewPageProps): Promise<Metadata> {
  const { id } = await params
  const post = await getBlogPostForAdminById(id)
  if (!post) return { title: 'Preview' }
  return { title: `Preview: ${post.title}`, robots: { index: false, follow: false } }
}

export default async function BlogPreviewPage({ params }: BlogPreviewPageProps) {
  const { id } = await params
  const post = await getBlogPostForAdminById(id)
  if (!post) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">Preview</p>
        <Link href={`/admin/blog/${post.id}`} className="text-sm text-zinc-400 hover:text-white">← Back to editor</Link>
      </div>

      {post.featuredImage && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-white/[0.08]">
          <Image src={post.featuredImage} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" unoptimized={post.featuredImage.startsWith('/')} />
        </div>
      )}

      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-xs text-zinc-400">{post.status}</span>
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary">{tag}</span>
          ))}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{post.title}</h1>
        <p className="text-zinc-400">{post.excerpt}</p>
      </header>

      <article className="prose prose-invert max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-300">{post.content}</pre>
      </article>
    </div>
  )
}
