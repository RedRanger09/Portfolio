import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE } from '@/config/site.config'
import { getAllProjectSlugs, getProjectBySlug, ProjectDetail } from '@/features/portfolio/projects'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

/** Pre-renders every real case study at build time. Placeholder projects are excluded — see `getAllProjectSlugs`. */
export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project || project.isPlaceholder) {
    return {}
  }

  const title = `${project.name} — Project | ${SITE.name}`
  const path = `/projects/${project.slug}`
  const images = project.screenshot ? [project.screenshot] : undefined

  return {
    title,
    description: project.description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: project.description,
      url: path,
      type: 'article',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: project.description,
      images,
    },
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  // Placeholder projects have no real case-study content, so a direct visit
  // to their slug is treated the same as an unknown slug.
  if (!project || project.isPlaceholder) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    description: project.description,
    url: `${SITE.siteUrl}/projects/${project.slug}`,
    image: project.screenshot || undefined,
    author: {
      '@type': 'Person',
      name: SITE.name,
      url: SITE.siteUrl,
    },
    keywords: project.techStack?.join(', '),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProjectDetail project={project} />
    </>
  )
}
