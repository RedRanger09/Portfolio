export interface ProjectMetric {
  label: string
  value: string
}

export interface ProjectGalleryItem {
  /** MediaAttachment id when loaded from the media library. */
  id?: string
  src: string
  caption: string
  /** Accessibility text — falls back to caption when omitted in legacy JSON. */
  altText: string
}

export interface ProjectDemo {
  label: string
  href: string
}

/** Per-section visibility flags for the public case-study page. */
export interface ProjectSectionVisibility {
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
}

export const DEFAULT_PROJECT_SECTION_VISIBILITY: ProjectSectionVisibility = {
  showOverview: true,
  showProblem: true,
  showTechStack: true,
  showArchitecture: true,
  showImplementation: true,
  showChallenges: true,
  showLessonsLearned: true,
  showFutureImprovements: true,
  showGallery: true,
  showVideo: true,
  showLiveDemo: true,
  showMetrics: true,
  showArchitectureImage: true,
  showRagPipelineImage: true,
}

export interface ProjectSectionTitles {
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
}

export const DEFAULT_PROJECT_SECTION_TITLES: ProjectSectionTitles = {
  overviewTitle: 'Overview',
  problemTitle: 'Problem',
  techStackTitle: 'Tech Stack',
  architectureTitle: 'Architecture',
  implementationTitle: 'Implementation',
  challengesTitle: 'Challenges',
  lessonsLearnedTitle: 'Lessons learned',
  futureImprovementsTitle: 'Future improvements',
  galleryTitle: 'Screenshots',
  videoTitle: 'Demo video',
  liveDemoTitle: 'Live demo',
}

export interface Project extends ProjectSectionVisibility, ProjectSectionTitles {
  slug: string
  featured: boolean
  isPlaceholder?: boolean
  name: string
  category: string
  /** Hero eyebrow — falls back to `category` on the public page when empty. */
  heroEyebrow: string
  tagline: string
  description: string
  techStack: string[]
  github: string
  liveDemo: string
  caseStudy: string
  screenshot: string
  architectureImage: string
  ragPipelineImage?: string
  metrics: ProjectMetric[]
  overview: string
  problem: string
  architecture: string[]
  implementation: string[]
  challenges: string[]
  lessonsLearned: string[]
  futureImprovements: string[]
  gallery: ProjectGalleryItem[]
  demo?: ProjectDemo
}

/**
 * Section-wide editorial copy — distinct from any single `Project` record,
 * so it lives beside the array rather than inside it. Mirrors how
 * `about/data.ts` separates section header copy from per-item content.
 */
export interface ProjectsSectionContent {
  label: string
  title: string
  subtitle: string
  /** Eyebrow shown above the featured project's title. */
  featuredEyebrow: string
  /** Overlay text shown on a project's screenshot while `isPlaceholder` is true. */
  comingSoonLabel: string
}
