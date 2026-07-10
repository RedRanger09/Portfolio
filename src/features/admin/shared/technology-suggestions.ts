import { prisma } from '@/lib/prisma'

/** Technology names for admin multi-select suggestions (Projects, Skills, …). */
export async function getTechnologyNamesForAdmin(): Promise<string[]> {
  const rows = await prisma.technology.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  })

  return rows.map((row) => row.name)
}
