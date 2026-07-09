export interface ProjectMetric {
  label: string
  value: string
}

export interface ProjectGalleryItem {
  src: string
  caption: string
}

export interface ProjectDemo {
  label: string
  href: string
}

export interface Project {
  slug: string
  featured: boolean
  isPlaceholder?: boolean
  name: string
  category: string
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
