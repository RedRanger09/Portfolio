import { prisma } from '@/lib/prisma'

export async function getAboutForAdmin() {
  const row = await prisma.about.findFirst()
  if (!row) return null
  return {
    label: row.label,
    title: row.title,
    subtitle: row.subtitle,
    story: row.story,
    currentlyLearning: { title: row.currentlyLearningTitle, items: row.currentlyLearningItems },
    interestsLabel: row.interestsLabel,
    interests: row.interests,
  }
}
