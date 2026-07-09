import type { Project, ProjectsSectionContent } from './types'

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

const projects: Project[] = [
  {
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
      { src: '/project-images/query.png', caption: 'Query interface' },
      { src: '/project-images/systemflow.png', caption: 'System flow' },
    ],
    demo: {
      label: 'Live demo',
      href: 'https://www.youtube.com/watch?v=IuMyLUE900g',
    },
  },
  {
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
    gallery: [{ src: '/project-images/visionforge-screenshot.svg', caption: 'Training / pipeline preview' }],
  },
  {
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
    gallery: [{ src: '/project-images/visionforge-screenshot.svg', caption: 'Experiment snapshot' }],
  },
  {
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
    gallery: [{ src: '/project-images/visionforge-screenshot.svg', caption: 'Pipeline preview' }],
  },
  {
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
  },
]

export async function getProjects(): Promise<Project[]> {
  return projects
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  return projects.find((project) => project.slug === slug)
}

export async function getFeaturedProject(): Promise<Project | undefined> {
  return projects.find((project) => project.featured)
}

/** All static params for the `/projects/[slug]` route — used by `generateStaticParams`. */
export async function getAllProjectSlugs(): Promise<string[]> {
  return projects.map((project) => project.slug)
}
