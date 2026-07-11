import { prisma } from '@/lib/prisma'
import type { HeroCta, InterestCard } from '@/features/portfolio/hero/types'

export async function getHeroForAdmin() {
  const row = await prisma.hero.findFirst()
  if (!row) return null
  return {
    eyebrow: row.eyebrow,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    profileImage: row.profileImage,
    interestCards: row.interestCards as unknown as InterestCard[],
    ctas: row.ctas as unknown as HeroCta[],
    showInterestCards: row.showInterestCards,
  }
}
