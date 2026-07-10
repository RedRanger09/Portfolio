import type { ProjectRow } from '@/features/portfolio/projects/data'
import { resolveMediaUrl } from '@/features/media/lib/resolve-media-url'
import {
  DEFAULT_PROJECT_SECTION_TITLES,
  DEFAULT_PROJECT_SECTION_VISIBILITY,
  type ProjectMetric,
} from '@/features/portfolio/projects/types'

export interface AdminProjectListItem {
  id: string
  slug: string
  name: string
  category: string
  featured: boolean
  isPlaceholder: boolean
  /** UI alias for `!isPlaceholder` until a dedicated `published` column exists. */
  published: boolean
  order: number
  updatedAt: string
  screenshot: string
}

export interface ProjectEditorValues {
  name: string
  slug: string
  tagline: string
  description: string
  category: string
  heroEyebrow: string
  featured: boolean
  published: boolean
  techStack: string[]
  github: string
  liveDemo: string
  demoLabel: string
  demoHref: string
  screenshot: string
  screenshotMediaId: string | null
  architectureImage: string
  ragPipelineImage: string
  metrics: ProjectMetric[]
  overview: string
  problem: string
  architecture: string[]
  implementation: string[]
  challenges: string[]
  lessonsLearned: string[]
  futureImprovements: string[]
  overviewTitle: string
  problemTitle: string
  techStackTitle: string
  architectureTitle: string
  implementationTitle: string
  challengesTitle: string
  lessonsLearnedTitle: string
  futureImprovementsTitle: string
  galleryTitle: string
  videoTitle: string
  liveDemoTitle: string
  showOverview: boolean
  showProblem: boolean
  showTechStack: boolean
  showArchitecture: boolean
  showImplementation: boolean
  showChallenges: boolean
  showLessonsLearned: boolean
  showFutureImprovements: boolean
  showGallery: boolean
  showVideo: boolean
  showLiveDemo: boolean
  showMetrics: boolean
  showArchitectureImage: boolean
  showRagPipelineImage: boolean
  order: number
}

export type ProjectSortKey = 'order' | 'name' | 'category' | 'updatedAt'
export type ProjectFilterKey = 'all' | 'published' | 'draft' | 'featured'

export const EMPTY_PROJECT_EDITOR_VALUES: ProjectEditorValues = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  category: '',
  heroEyebrow: '',
  featured: false,
  published: true,
  techStack: [],
  github: '',
  liveDemo: '',
  demoLabel: 'Watch demo',
  demoHref: '',
  screenshot: '/project-images/visionforge-screenshot.svg',
  screenshotMediaId: null,
  architectureImage: '',
  ragPipelineImage: '',
  metrics: [],
  overview: '',
  problem: '',
  architecture: [],
  implementation: [],
  challenges: [],
  lessonsLearned: [],
  futureImprovements: [],
  ...DEFAULT_PROJECT_SECTION_TITLES,
  ...DEFAULT_PROJECT_SECTION_VISIBILITY,
  order: 0,
}

function mapMetrics(metrics: unknown): ProjectMetric[] {
  if (!Array.isArray(metrics)) return []
  return metrics
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const record = entry as { label?: unknown; value?: unknown }
      if (typeof record.label !== 'string' || typeof record.value !== 'string') return null
      return { label: record.label, value: record.value }
    })
    .filter((item): item is ProjectMetric => item !== null)
}

export function mapProjectRowToEditorValues(row: ProjectRow): ProjectEditorValues {
  return {
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    heroEyebrow: row.heroEyebrow ?? '',
    featured: row.featured,
    published: !row.isPlaceholder,
    techStack: row.technologies.map((entry) => entry.technology.name),
    github: row.github ?? '',
    liveDemo: row.liveDemo ?? '',
    demoLabel: row.demoLabel ?? 'Watch demo',
    demoHref: row.demoHref ?? '',
    screenshot: resolveMediaUrl(row.screenshotMedia, row.screenshot),
    screenshotMediaId: row.screenshotMediaId ?? null,
    architectureImage: row.architectureImage ?? '',
    ragPipelineImage: row.ragPipelineImage ?? '',
    metrics: mapMetrics(row.metrics),
    overview: row.overview,
    problem: row.problem,
    architecture: row.architecture,
    implementation: row.implementation,
    challenges: row.challenges,
    lessonsLearned: row.lessonsLearned,
    futureImprovements: row.futureImprovements,
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
    order: row.order,
  }
}

export function mapEditorValuesToCreateInput(values: ProjectEditorValues) {
  const demo =
    values.demoHref.trim().length > 0
      ? { label: values.demoLabel.trim() || 'Watch demo', href: values.demoHref.trim() }
      : undefined

  return {
    slug: values.slug,
    featured: values.featured,
    isPlaceholder: !values.published,
    name: values.name,
    category: values.category,
    heroEyebrow: values.heroEyebrow,
    tagline: values.tagline,
    description: values.description,
    techStack: values.techStack,
    github: values.github,
    liveDemo: values.liveDemo,
    demo,
    screenshot: values.screenshot,
    screenshotMediaId: values.screenshotMediaId,
    architectureImage: values.architectureImage,
    ragPipelineImage: values.ragPipelineImage,
    metrics: values.metrics.filter((metric) => metric.label.trim() && metric.value.trim()),
    overview: values.overview,
    problem: values.problem,
    architecture: values.architecture.map((item) => item.trim()).filter(Boolean),
    implementation: values.implementation.map((item) => item.trim()).filter(Boolean),
    challenges: values.challenges.map((item) => item.trim()).filter(Boolean),
    lessonsLearned: values.lessonsLearned.map((item) => item.trim()).filter(Boolean),
    futureImprovements: values.futureImprovements.map((item) => item.trim()).filter(Boolean),
    overviewTitle: values.overviewTitle,
    problemTitle: values.problemTitle,
    techStackTitle: values.techStackTitle,
    architectureTitle: values.architectureTitle,
    implementationTitle: values.implementationTitle,
    challengesTitle: values.challengesTitle,
    lessonsLearnedTitle: values.lessonsLearnedTitle,
    futureImprovementsTitle: values.futureImprovementsTitle,
    galleryTitle: values.galleryTitle,
    videoTitle: values.videoTitle,
    liveDemoTitle: values.liveDemoTitle,
    showOverview: values.showOverview,
    showProblem: values.showProblem,
    showTechStack: values.showTechStack,
    showArchitecture: values.showArchitecture,
    showImplementation: values.showImplementation,
    showChallenges: values.showChallenges,
    showLessonsLearned: values.showLessonsLearned,
    showFutureImprovements: values.showFutureImprovements,
    showGallery: values.showGallery,
    showVideo: values.showVideo,
    showLiveDemo: values.showLiveDemo,
    showMetrics: values.showMetrics,
    showArchitectureImage: values.showArchitectureImage,
    showRagPipelineImage: values.showRagPipelineImage,
    order: values.order,
  }
}

export function mapEditorValuesToUpdateInput(id: string, values: ProjectEditorValues) {
  return {
    id,
    ...mapEditorValuesToCreateInput(values),
  }
}
