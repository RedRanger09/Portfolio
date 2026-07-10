import { prisma } from '@/lib/prisma'
import type { AdminCertificationListItem } from './types'

const SELECT = { id: true, name: true, provider: true, completionDate: true, order: true, updatedAt: true, image: true } as const

export async function getCertificationsForAdmin(): Promise<AdminCertificationListItem[]> {
  const rows = await prisma.certification.findMany({ select: SELECT, orderBy: { order: 'asc' } })
  return rows.map((row) => ({ id: row.id, name: row.name, provider: row.provider, completionDate: row.completionDate ?? '', order: row.order, updatedAt: row.updatedAt.toISOString(), image: row.image }))
}

export async function getCertificationForAdminById(id: string) {
  const row = await prisma.certification.findUnique({ where: { id } })
  if (!row) return null
  return { id: row.id, name: row.name, provider: row.provider, providerLogo: row.providerLogo ?? '', completionDate: row.completionDate ?? '', credentialUrl: row.credentialUrl, verifyUrl: row.verifyUrl, image: row.image, order: row.order }
}
