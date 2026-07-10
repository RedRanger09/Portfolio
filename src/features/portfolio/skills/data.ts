import type { Prisma, SkillIcon as PrismaSkillIcon } from '@prisma/client'
import { withDbFallback } from '@/lib/db-fallback'
import { mapAccentColor } from '@/lib/prisma-enum-mappers'
import { prisma } from '@/lib/prisma'
import type { SkillGroup, SkillGroupIcon, SkillsSectionContent } from './types'

const skillsSectionContent: SkillsSectionContent = {
  label: 'Skills',
  title: 'What I work with',
  subtitle: 'Tools and frameworks I reach for when building coursework and side projects.',
}

/**
 * Static fallback — also the source `prisma/seed.ts` seeds
 * `SkillCategory`/`Skill`/`Technology` from. Served directly today; once
 * migrated, served only if the database is unreachable or unseeded
 * (`src/lib/db-fallback.ts`).
 */
export const FALLBACK_SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Programming',
    icon: 'Code2',
    accent: 'cyan',
    items: [
      { name: 'Python', logo: 'python' },
      { name: 'JavaScript', logo: 'javascript' },
      { name: 'Java', logo: 'java' },
      { name: 'C++', logo: 'cplusplus' },
      { name: 'SQL', logo: 'mysql' },
      { name: 'HTML5', logo: 'html5' },
      { name: 'CSS3', logo: 'css3' },
    ],
    note: 'Daily languages for coursework and projects',
  },
  {
    title: 'AI / ML',
    icon: 'Brain',
    accent: 'purple',
    items: [
      { name: 'PyTorch', logo: 'pytorch' },
      { name: 'TensorFlow', logo: 'tensorflow' },
      { name: 'scikit-learn', logo: 'scikitlearn' },
      { name: 'OpenCV', logo: 'opencv' },
      { name: 'Streamlit', logo: 'streamlit' },
      { name: 'Google Gemini', logo: 'googlegemini' },
      { name: 'LM Studio', logo: 'ollama' },
    ],
    note: 'Where most of my project energy goes',
  },
  {
    title: 'Frameworks & Web',
    icon: 'Layout',
    accent: 'emerald',
    items: [
      { name: 'React', logo: 'react' },
      { name: 'Node.js', logo: 'nodedotjs' },
      { name: 'TailwindCSS', logo: 'tailwindcss' },
      { name: 'Vite', logo: 'vite' },
      { name: 'Framer Motion', logo: 'framer' },
      { name: 'FastAPI', logo: 'fastapi' },
    ],
    note: 'Frontends and backends for my AI projects',
  },
  {
    title: 'Developer Tools',
    icon: 'Wrench',
    accent: 'amber',
    items: [
      { name: 'Git', logo: 'git' },
      { name: 'GitHub', logo: 'github' },
      { name: 'VS Code', logo: 'visualstudiocode' },
      { name: 'Jupyter', logo: 'jupyter' },
      { name: 'Postman', logo: 'postman' },
      { name: 'Docker', logo: 'docker' },
    ],
    note: 'My everyday development environment',
  },
  {
    title: 'Cloud & APIs',
    icon: 'Cloud',
    accent: 'pink',
    items: [
      { name: 'Google Cloud', logo: 'googlecloud' },
      { name: 'Hugging Face', logo: 'huggingface' },
      { name: 'OpenAI', logo: 'openai' },
      { name: 'Coursera', logo: 'coursera' },
    ],
    note: 'APIs and platforms I integrate with',
  },
]

/** Mirrors `SkillIcon` in `prisma/schema.prisma` — only this feature reads it, so the mapper stays local. */
const SKILL_ICON_MAP: Record<PrismaSkillIcon, SkillGroupIcon> = {
  CODE2: 'Code2',
  BRAIN: 'Brain',
  LAYOUT: 'Layout',
  WRENCH: 'Wrench',
  CLOUD: 'Cloud',
}

export const SKILL_CATEGORY_INCLUDE = {
  skills: {
    include: { technology: true },
    orderBy: { order: 'asc' },
  },
} satisfies Prisma.SkillCategoryInclude

export type SkillCategoryRow = Prisma.SkillCategoryGetPayload<{ include: typeof SKILL_CATEGORY_INCLUDE }>

function mapSkillCategoryRow(row: SkillCategoryRow): SkillGroup {
  return {
    title: row.title,
    icon: SKILL_ICON_MAP[row.icon],
    accent: mapAccentColor(row.accent),
    items: row.skills.map((skill) => ({
      name: skill.technology.name,
      logo: skill.technology.logoSlug ?? '',
    })),
    note: row.note,
  }
}

/**
 * Returns every skill group, in curated display order. Reads from the
 * database, falling back to `FALLBACK_SKILL_GROUPS` if the database is
 * unreachable or unseeded (`src/lib/db-fallback.ts`).
 */
export async function getSkillGroups(): Promise<SkillGroup[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.skillCategory.findMany({
        include: SKILL_CATEGORY_INCLUDE,
        orderBy: { order: 'asc' },
      })
      return rows.map(mapSkillCategoryRow)
    },
    FALLBACK_SKILL_GROUPS,
    'skills',
  )
}

export async function getSkillsSectionContent(): Promise<SkillsSectionContent> {
  return skillsSectionContent
}
