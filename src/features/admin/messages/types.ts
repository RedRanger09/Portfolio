import type { ContactMessageStatus } from '@prisma/client'

export type MessageFilterKey = 'all' | 'unread' | 'read' | 'archived'

export interface AdminMessageListItem {
  id: string
  name: string
  email: string
  subject: string
  body: string
  status: ContactMessageStatus
  createdAt: string
}
