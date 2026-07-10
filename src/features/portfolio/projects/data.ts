import { cache } from 'react'
import type { Prisma } from '@prisma/client'
import { withDbFallback } from '@/lib/db-fallback'
import { prisma } from '@/lib/prisma'
import { resolveMediaUrl } from '@/features/media/lib/resolve-media-url'
import { listMediaGalleryItems } from '@/features/media/lib/media-attachments'
import { MEDIA_ATTACHABLE_TYPE } from '@/features/media/lib/media-attachment-constants'
import type { MediaGalleryItem } from '@/features/media/types'
import type { Project, ProjectGalleryItem, ProjectMetric, ProjectsSectionContent } from './types'
import { DEFAULT_PROJECT_SECTION_TITLES, DEFAULT_PROJECT_SECTION_VISIBILITY } from './types'

/** Applies CMS section defaults so fallback/seed rows stay in sync with Prisma defaults. */
function withCaseStudyDefaults(project: Omit<Project, keyof typeof DEFAULT_PROJECT_SECTION_VISIBILITY | keyof typeof DEFAULT_PROJECT_SECTION_TITLES | 'heroEyebrow'> & Partial<Project>): Project {
  return {
    ...DEFAULT_PROJECT_SECTION_VISIBILITY,
    ...DEFAULT_PROJECT_SECTION_TITLES,
    heroEyebrow: '',
    ...project,
  }
}

const projectsSectionContent: ProjectsSectionContent = {
  label: 'Projects',
  title: "Things I've actually built",
  subtitle: 'Lumora is the main one. The rest are smaller learning projects — with more coming.',
  featuredEyebrow: 'Featured project',
  comingSoonLabel: 'Coming soon',
}

export async function getProjectsSectionContent(): Promise<ProjectsSectionContent> {
  return projectsSectionContent
}

/**
 * Static fallback — also the source `prisma/seed.ts` seeds
 * `Project`/`Technology`/`ProjectTechnology` from. Served directly today;
 * once migrated, served only if the database is unreachable or unseeded
 * (`src/lib/db-fallback.ts`).
 */
export const FALLBACK_PROJECTS: Project[] = [
  withCaseStudyDefaults({
    slug: 'lumora',
    featured: true,
    name: 'Lumora',
    category: 'Academic Assistant for AKTU',
    tagline: 'Ask questions over your study material and get grounded answers.',
    description:
      'A RAG-based assistant I built to search course notes and PDFs semantically, then answer with Gemini — with a local LLM fallback through LM Studio.',
    techStack: ['React', 'Vite', 'TailwindCSS', 'Python', 'FAISS', 'Google Gemini', 'LM Studio', 'RAG'],
    github: 'https://github.com/RedRanger09/Lumora',
    liveDemo: 'https://example.com/',
    caseStudy: '/projects/lumora',
    screenshot: '/project-images/lumora-screenshot.png',
    architectureImage: '/project-images/lumora-architecture.png',
    ragPipelineImage: '/project-images/rag.png',
    metrics: [
      { label: 'Retrieval', value: 'FAISS vector search' },
      { label: 'Models', value: 'Gemini + local fallback' },
      { label: 'Stack', value: 'React + Python' },
    ],
    overview:
      'Lumora lets me ask natural-language questions over academic resources and get answers grounded in retrieved context instead of guessing.',
    problem:
      'Course material was scattered across PDFs and notes. Keyword search was not enough, and generic chatbots hallucinated without sources.',
    architecture: [
      'Documents chunked and embedded into a vector index',
      'FAISS retrieves relevant chunks per query',
      'Context injected into prompts before generation',
      'Gemini primary; LM Studio as offline fallback',
    ],
    implementation: [
      'Retrieval-first query flow',
      'Semantic chunking + FAISS indexing',
      'Responsive query UI',
      'Model routing between cloud and local inference',
    ],
    challenges: [
      'Balancing retrieval breadth vs. answer precision',
      'Stable UX when switching inference providers',
      'Keeping prompts concise to reduce hallucinations',
    ],
    lessonsLearned: [
      'Grounding matters: retrieval quality often beats prompt tweaking',
      'Clear UX helps trust (what was retrieved, what model answered)',
      'Evaluation is hard without a small test set and real queries',
    ],
    futureImprovements: [
      'Hybrid keyword + vector retrieval',
      'Inline citations with source previews',
      'Conversation history per topic',
    ],
    gallery: [
      { src: '/project-images/query.png', caption: 'Query interface', altText: 'Query interface' },
      { src: '/project-images/systemflow.png', caption: 'System flow', altText: 'System flow' },
    ],
    demo: {
      label: 'Watch demo',
      href: 'https://www.youtube.com/watch?v=IuMyLUE900g',
    },
  }),
  withCaseStudyDefaults({
    slug: 'cnn-image-classifier',
    featured: false,
    name: 'CNN Image Classifier',
    category: 'Computer Vision',
    tagline: 'A hands-on CNN project to learn training, evaluation, and deployment basics.',
    description: 'A CNN-based image classification project built as part of my deep learning learning path.',
    techStack: ['Python', 'PyTorch'],
    github: 'https://github.com/',
    liveDemo: '',
    caseStudy: '/projects/cnn-image-classifier',
    screenshot: '/project-images/visionforge-screenshot.svg',
    architectureImage: '/project-images/visionforge-architecture.svg',
    metrics: [],
    overview: 'A practical CNN project to build intuition around data pipelines and training loops.',
    problem: 'Move beyond theory and train an end-to-end image model with proper evaluation.',
    architecture: ['Dataset → transforms', 'CNN model', 'Training loop', 'Metrics + confusion analysis'],
    implementation: ['Data loading', 'Model training', 'Evaluation metrics', 'Experiment tracking (basic)'],
    challenges: ['Overfitting', 'Hyperparameter choices', 'Dataset quality'],
    lessonsLearned: ['Training curves tell a story', 'Data quality dominates', 'Small baselines matter'],
    futureImprovements: ['Augmentations', 'Better experiment tracking', 'Deploy a small demo'],
    gallery: [{ src: '/project-images/visionforge-screenshot.svg', caption: 'Training / pipeline preview', altText: 'Training / pipeline preview' }],
  }),
  withCaseStudyDefaults({
    slug: 'fashion-mnist',
    featured: false,
    name: 'Fashion MNIST',
    category: 'Deep Learning',
    tagline: 'Classic dataset, used to practice clean training + evaluation workflows.',
    description: 'Training a simple neural network on the Fashion-MNIST dataset to classify clothing images into 10 categories and then visualizes predictions for sample images.',
    techStack: ['Python', 'PyTorch'],
    github: 'https://github.com/Akshay6601/Neural-Network',
    liveDemo: '',
    caseStudy: '/projects/fashion-mnist',
    screenshot: '/project-images/visionforge-screenshot.svg',
    architectureImage: '/project-images/visionforge-architecture.svg',
    metrics: [],
    overview: 'A clean baseline project to practice consistent training and reporting.',
    problem: 'Build a reliable training pipeline and compare small model variants.',
    architecture: ['Data loader', 'Model', 'Training', 'Evaluation'],
    implementation: ['Baselines', 'Regularization', 'Metrics reporting'],
    challenges: ['Stability across runs'],
    lessonsLearned: ['Consistent evaluation beats fancy models'],
    futureImprovements: ['Add a small web demo'],
    gallery: [{ src: '/project-images/visionforge-screenshot.svg', caption: 'Experiment snapshot', altText: 'Experiment snapshot' }],
  }),
  withCaseStudyDefaults({
    slug: 'sign-language-recognition',
    featured: false,
    name: 'Sign Language Recognition',
    category: 'Computer Vision',
    tagline: 'Exploring recognition pipelines and a practical dataset-to-model workflow.',
    description: 'A sign language recognition project to explore feature learning and evaluation.',
    techStack: ['Python', 'OpenCV', 'PyTorch'],
    github: 'https://github.com/',
    liveDemo: '',
    caseStudy: '/projects/sign-language-recognition',
    screenshot: '/project-images/visionforge-screenshot.svg',
    architectureImage: '/project-images/visionforge-architecture.svg',
    metrics: [],
    overview: 'A learning project focused on the CV pipeline, datasets, and evaluation.',
    problem: 'Learn the practical workflow of building a recognition system end-to-end.',
    architecture: ['Dataset', 'Preprocessing', 'Model', 'Evaluation'],
    implementation: ['Data prep', 'Training', 'Validation', 'Error analysis'],
    challenges: ['Dataset constraints', 'Generalization'],
    lessonsLearned: ['Error analysis matters', 'Data collection is hard'],
    futureImprovements: ['Improve dataset + add demo'],
    gallery: [{ src: '/project-images/visionforge-screenshot.svg', caption: 'Pipeline preview', altText: 'Pipeline preview' }],
  }),
  withCaseStudyDefaults({
    slug: 'future-project-1',
    featured: false,
    isPlaceholder: true,
    name: 'Future Project',
    category: 'Coming soon',
    tagline: 'Placeholder — add your next project by editing one object in the data file.',
    description: 'New projects will show up here automatically.',
    techStack: [],
    github: '',
    liveDemo: '',
    caseStudy: '',
    screenshot: '/project-images/visionforge-screenshot.svg',
    architectureImage: '/project-images/visionforge-architecture.svg',
    metrics: [],
    overview: '',
    problem: '',
    architecture: [],
    implementation: [],
    challenges: [],
    lessonsLearned: [],
    futureImprovements: [],
    gallery: [],
  }),
]

/**
 * Shared `include` for every query below that needs a full `Project` row —
 * the ordered `technologies → technology` join that reconstructs
 * `Project.techStack: string[]` from the normalized `Technology` table
 * (`domain-model.md §4.1`). Defined once so `getProjects`/`getProjectBySlug`/
 * `getFeaturedProject` can't drift out of sync with each other's shape.
 */
export const PROJECT_INCLUDE = {
  technologies: {
    include: { technology: true },
    orderBy: { order: 'asc' },
  },
  screenshotMedia: {
    select: {
      id: true,
      url: true,
      secureUrl: true,
      altText: true,
    },
  },
} satisfies Prisma.ProjectInclude

export type ProjectRow = Prisma.ProjectGetPayload<{ include: typeof PROJECT_INCLUDE }>

function mapAttachmentGallery(items: MediaGalleryItem[]): ProjectGalleryItem[] {
  return items.map((item) => ({
    id: item.attachmentId,
    src: item.src,
    caption: item.caption,
    altText: item.altText,
  }))
}

function mapLegacyJsonGallery(gallery: unknown): ProjectGalleryItem[] {
  if (!Array.isArray(gallery)) return []

  return gallery
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const record = entry as { src?: unknown; caption?: unknown; altText?: unknown }
      if (typeof record.src !== 'string' || !record.src) return null
      const caption = typeof record.caption === 'string' ? record.caption : ''
      const altText = typeof record.altText === 'string' && record.altText ? record.altText : caption || 'Screenshot'
      return { src: record.src, caption, altText }
    })
    .filter((item): item is ProjectGalleryItem => item !== null)
}

/** Maps one `Project` row (with its ordered `technologies` join) to the app's `Project` shape. */
function mapProjectRow(row: ProjectRow, galleryItems?: MediaGalleryItem[]): Project {
  const gallery =
    galleryItems && galleryItems.length > 0
      ? mapAttachmentGallery(galleryItems)
      : mapLegacyJsonGallery(row.gallery)

  return {
    slug: row.slug,
    featured: row.featured,
    isPlaceholder: row.isPlaceholder,
    name: row.name,
    category: row.category,
    heroEyebrow: row.heroEyebrow ?? '',
    tagline: row.tagline,
    description: row.description,
    techStack: row.technologies.map((pt) => pt.technology.name),
    github: row.github ?? '',
    liveDemo: row.liveDemo ?? '',
    // Derived, not stored — see the normalization note on the `Project`
    // model in `prisma/schema.prisma`.
    caseStudy: `/projects/${row.slug}`,
    screenshot: resolveMediaUrl(row.screenshotMedia, row.screenshot),
    architectureImage: row.architectureImage ?? '',
    ragPipelineImage: row.ragPipelineImage ?? undefined,
    // Trusted, self-seeded JSON — not user input — so a direct cast is safe.
    metrics: (row.metrics as unknown as ProjectMetric[] | null) ?? [],
    overview: row.overview,
    problem: row.problem,
    architecture: row.architecture,
    implementation: row.implementation,
    challenges: row.challenges,
    lessonsLearned: row.lessonsLearned,
    futureImprovements: row.futureImprovements,
    gallery,
    demo: row.demoLabel && row.demoHref ? { label: row.demoLabel, href: row.demoHref } : undefined,
    overviewTitle: row.overviewTitle,
    problemTitle: row.problemTitle,
    techStackTitle: row.techStackTitle,
    architectureTitle: row.architectureTitle,
    implementationTitle: row.implementationTitle,
    challengesTitle: row.challengesTitle,
    lessonsLearnedTitle: row.lessonsLearnedTitle,
    futureImprovementsTitle: row.futureImprovementsTitle,
    galleryTitle: row.galleryTitle,
    videoTitle: row.videoTitle,
    liveDemoTitle: row.liveDemoTitle,
    showOverview: row.showOverview,
    showProblem: row.showProblem,
    showTechStack: row.showTechStack,
    showArchitecture: row.showArchitecture,
    showImplementation: row.showImplementation,
    showChallenges: row.showChallenges,
    showLessonsLearned: row.showLessonsLearned,
    showFutureImprovements: row.showFutureImprovements,
    showGallery: row.showGallery,
    showVideo: row.showVideo,
    showLiveDemo: row.showLiveDemo,
    showMetrics: row.showMetrics,
    showArchitectureImage: row.showArchitectureImage,
    showRagPipelineImage: row.showRagPipelineImage,
  }
}

async function loadGalleriesByProjectId(projectIds: string[]): Promise<Map<string, MediaGalleryItem[]>> {
  return listMediaGalleryItems({
    attachableType: MEDIA_ATTACHABLE_TYPE.PROJECT,
    attachableIds: projectIds,
  })
}

/**
 * Returns every project, in curated display order. Reads from the
 * database, falling back to `FALLBACK_PROJECTS` if the database is
 * unreachable or unseeded (`src/lib/db-fallback.ts`).
 */
export async function getProjects(): Promise<Project[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.project.findMany({
        include: PROJECT_INCLUDE,
        orderBy: { order: 'asc' },
      })
      const galleries = await loadGalleriesByProjectId(rows.map((row) => row.id))
      return rows.map((row) => mapProjectRow(row, galleries.get(row.id)))
    },
    FALLBACK_PROJECTS,
    'projects',
  )
}

/**
 * Wrapped in React's `cache()` so `/projects/[slug]`'s `generateMetadata`
 * and page component — which both need the same project — share one
 * lookup per request instead of running it twice (`ARCHITECTURE.md §4`).
 */
export const getProjectBySlug = cache(async (slug: string): Promise<Project | undefined> => {
  return withDbFallback(
    async () => {
      const row = await prisma.project.findUnique({
        where: { slug },
        include: PROJECT_INCLUDE,
      })
      if (!row) return null
      const galleries = await loadGalleriesByProjectId([row.id])
      return mapProjectRow(row, galleries.get(row.id))
    },
    FALLBACK_PROJECTS.find((project) => project.slug === slug),
    `project:${slug}`,
  )
})

export async function getFeaturedProject(): Promise<Project | undefined> {
  return withDbFallback(
    async () => {
      const row = await prisma.project.findFirst({
        where: { featured: true },
        include: PROJECT_INCLUDE,
      })
      if (!row) return null
      const galleries = await loadGalleriesByProjectId([row.id])
      return mapProjectRow(row, galleries.get(row.id))
    },
    FALLBACK_PROJECTS.find((project) => project.featured),
    'featured-project',
  )
}

/**
 * Static params for the `/projects/[slug]` route — used by
 * `generateStaticParams`. Excludes placeholder projects: they have no real
 * case-study content, so `/projects/[slug]` treats them as not found
 * (`isPlaceholder` check in `app/projects/[slug]/page.tsx`) rather than
 * pre-rendering an empty page for them. Selects only `slug` — this query
 * needs nothing else.
 */
export async function getAllProjectSlugs(): Promise<string[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.project.findMany({
        where: { isPlaceholder: false },
        select: { slug: true },
        orderBy: { order: 'asc' },
      })
      return rows.map((row) => row.slug)
    },
    FALLBACK_PROJECTS.filter((project) => !project.isPlaceholder).map((project) => project.slug),
    'project-slugs',
  )
}
