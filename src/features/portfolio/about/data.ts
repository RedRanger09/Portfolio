import { withDbFallback } from '@/lib/db-fallback'
import { prisma } from '@/lib/prisma'
import type { AboutData } from './types'

/**
 * Static fallback — also the source `prisma/seed.ts` seeds the `About`
 * table from. Served directly today; once migrated, served only if the
 * database is unreachable or unseeded (`src/lib/db-fallback.ts`).
 */
export const FALLBACK_ABOUT_DATA: AboutData = {
  label: 'About Me',
  title: 'My journey (so far)',
  subtitle: 'A short version of how I got here.',
  story: [
    "I'm a B.Tech Computer Science student who started with programming fundamentals and small scripts.",
    'From there I got into web development so I could turn ideas into usable projects.',
    'Over time I became curious about Machine Learning, so I started the Andrew Ng ML Specialization and kept going into Deep Learning.',
    "Lately I've been most interested in RAG + LLMs — and I'm currently exploring agentic AI systems and how to evaluate them properly.",
  ],
  currentlyLearning: {
    title: 'Currently learning',
    items: [
      'Hybrid retrieval and reranking for better RAG',
      'Evaluating LLM outputs more systematically',
      'Strengthening fundamentals in deep learning',
    ],
  },
  interestsLabel: 'Interests',
  interests: ['Machine Learning', 'RAG systems', 'Full-stack web', 'Building useful student tools'],
}

/**
 * Returns About section content. Reads the singleton `About` row from the
 * database, falling back to `FALLBACK_ABOUT_DATA` if the database is
 * unreachable or unseeded (`src/lib/db-fallback.ts`).
 */
export async function getAboutData(): Promise<AboutData> {
  return withDbFallback(
    async () => {
      const row = await prisma.about.findFirst()
      if (!row) return null

      return {
        label: row.label,
        title: row.title,
        subtitle: row.subtitle,
        story: row.story,
        currentlyLearning: {
          title: row.currentlyLearningTitle,
          items: row.currentlyLearningItems,
        },
        interestsLabel: row.interestsLabel,
        interests: row.interests,
      }
    },
    FALLBACK_ABOUT_DATA,
    'about',
  )
}
