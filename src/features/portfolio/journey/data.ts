import type { JourneyIcon as PrismaJourneyIcon } from '@prisma/client'
import { withDbFallback } from '@/lib/db-fallback'
import { mapAccentColor } from '@/lib/prisma-enum-mappers'
import { prisma } from '@/lib/prisma'
import type { JourneyIcon, JourneySectionContent, JourneyStep } from './types'

const journeySectionContent: JourneySectionContent = {
  label: 'Learning Journey',
  title: 'How my interests evolved',
  subtitle: 'Click any milestone to read more. Chronological, based on what I actually did.',
}

/**
 * Static fallback — also the source `prisma/seed.ts` seeds the
 * `JourneyMilestone` table from. Served directly today; once migrated,
 * served only if the database is unreachable or unseeded
 * (`src/lib/db-fallback.ts`).
 */
export const FALLBACK_LEARNING_JOURNEY: JourneyStep[] = [
  {
    id: 'btech',
    label: 'Started B.Tech Computer Science',
    year: '2024',
    description: 'Enrolled in B.Tech Computer Science at SRMCEM. Began building strong CS fundamentals alongside coursework.',
    icon: 'GraduationCap',
    accent: 'purple',
  },
  {
    id: 'programming',
    label: 'Programming Fundamentals',
    year: '2024',
    description: 'Built a solid base in programming — logic, data structures, algorithms, and problem-solving patterns through coursework and practice.',
    icon: 'TerminalSquare',
    accent: 'emerald',
  },
  {
    id: 'python',
    label: 'Python',
    year: '2024',
    description: 'Learned Python for data manipulation, scripting, and automation. Became my go-to language for ML experiments.',
    icon: 'Code2',
    accent: 'emerald',
  },
  {
    id: 'web',
    label: 'Web Development',
    year: '2024',
    description: 'Got into web development so I could build real, usable interfaces for my projects. Learned React, Tailwind CSS, and the modern frontend stack.',
    icon: 'Globe',
    accent: 'cyan',
  },
  {
    id: 'ml',
    label: 'Machine Learning',
    year: '2024',
    description: 'Started exploring ML concepts — linear models, gradient descent, evaluation metrics, and the intuition behind learning algorithms.',
    icon: 'Brain',
    accent: 'purple',
  },
  {
    id: 'andrew',
    label: 'Andrew Ng ML Specialization',
    year: '2025–2026',
    description: 'Completed Supervised ML: Regression & Classification and Advanced Learning Algorithms on Coursera. Strong foundation in regression, neural networks, and decision trees.',
    icon: 'Award',
    accent: 'amber',
  },
  {
    id: 'ibm',
    label: 'IBM Artificial Intelligence Virtual Internship',
    year: '2025',
    description: "Completed IBM's AI Virtual Internship — applied ML concepts to structured real-world tasks and received certification from IBM.",
    icon: 'Building2',
    accent: 'cyan',
  },
  {
    id: 'nvidia',
    label: 'NVIDIA — Getting Started with Deep Learning',
    year: '2025',
    description: "Completed NVIDIA's Deep Learning course. Trained CNNs and gained hands-on GPU-accelerated training experience on real datasets.",
    icon: 'Zap',
    accent: 'emerald',
  },
  {
    id: 'cnn',
    label: 'CNN Projects',
    year: '2025',
    description: 'Built CNN-based classifiers from scratch — Fashion MNIST and Sign Language Recognition. Moved from theory to real training pipelines with evaluation.',
    icon: 'Image',
    accent: 'pink',
  },
  {
    id: 'lumora',
    label: 'Lumora',
    year: '2025–2026',
    description: 'Built Lumora — a full RAG-based academic assistant using FAISS, Google Gemini, and a React frontend. My most complete end-to-end project.',
    icon: 'Sparkles',
    accent: 'cyan',
  },
  {
    id: 'current',
    label: 'Currently Learning',
    year: 'Now',
    description: 'Actively exploring agentic AI systems, advanced RAG architectures (hybrid retrieval, reranking), and LLM evaluation — building intuition through hands-on experiments.',
    subItems: ['Agentic AI', 'Advanced RAG', 'LLM Evaluation'],
    icon: 'Workflow',
    accent: 'purple',
    isCurrent: true,
  },
]

/**
 * Mirrors `JourneyIcon` in `prisma/schema.prisma` — only this feature
 * reads/writes it, so both directions of the mapper stay local here
 * rather than in `src/lib/prisma-enum-mappers.ts`. `journey/actions/`
 * imports `JOURNEY_ICON_TO_DB` for writes.
 */
const JOURNEY_ICON_MAP: Record<PrismaJourneyIcon, JourneyIcon> = {
  GRADUATION_CAP: 'GraduationCap',
  BRAIN: 'Brain',
  WORKFLOW: 'Workflow',
  BUILDING2: 'Building2',
  GLOBE: 'Globe',
  ZAP: 'Zap',
  IMAGE: 'Image',
  TARGET: 'Target',
  SPARKLES: 'Sparkles',
  AWARD: 'Award',
  CODE2: 'Code2',
  TERMINAL_SQUARE: 'TerminalSquare',
}

export const JOURNEY_ICON_TO_DB: Record<JourneyIcon, PrismaJourneyIcon> = {
  GraduationCap: 'GRADUATION_CAP',
  Brain: 'BRAIN',
  Workflow: 'WORKFLOW',
  Building2: 'BUILDING2',
  Globe: 'GLOBE',
  Zap: 'ZAP',
  Image: 'IMAGE',
  Target: 'TARGET',
  Sparkles: 'SPARKLES',
  Award: 'AWARD',
  Code2: 'CODE2',
  TerminalSquare: 'TERMINAL_SQUARE',
}

/**
 * Returns every learning-journey milestone, in chronological display
 * order. Reads from the database, falling back to
 * `FALLBACK_LEARNING_JOURNEY` if the database is unreachable or unseeded
 * (`src/lib/db-fallback.ts`).
 */
export async function getLearningJourney(): Promise<JourneyStep[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.journeyMilestone.findMany({ where: { isVisible: true }, orderBy: { order: 'asc' } })
      return rows.map((row) => ({
        id: row.id,
        label: row.label,
        year: row.year,
        description: row.description,
        icon: JOURNEY_ICON_MAP[row.icon],
        accent: mapAccentColor(row.accent),
        subItems: row.subItems.length > 0 ? row.subItems : undefined,
        isCurrent: row.isCurrent || undefined,
      }))
    },
    FALLBACK_LEARNING_JOURNEY,
    'journey',
  )
}

export async function getJourneySectionContent(): Promise<JourneySectionContent> {
  return journeySectionContent
}
