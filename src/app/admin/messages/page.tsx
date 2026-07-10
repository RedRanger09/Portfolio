import type { Metadata } from 'next'
import { getMessagesForAdmin, MessagesInbox } from '@/features/admin/messages'

export const metadata: Metadata = { title: 'Messages' }

export default async function AdminMessagesPage() {
  const messages = await getMessagesForAdmin()
  return <MessagesInbox messages={messages} />
}
