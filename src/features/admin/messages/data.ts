import { prisma } from '@/lib/prisma'
import type { AdminMessageListItem } from './types'

export async function getMessagesForAdmin(): Promise<AdminMessageListItem[]> {
  const rows = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    body: row.body,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }))
}

export async function getMessageForAdminById(id: string) {
  return prisma.contactMessage.findUnique({ where: { id } })
}
