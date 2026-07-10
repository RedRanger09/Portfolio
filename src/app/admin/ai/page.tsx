import type { Metadata } from 'next'
import { Bot } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'AI' }

export default function AdminAiPage() {
  return (
    <ModulePlaceholder
      title="AI"
      description="Configure the AI portfolio chatbot — arrives with the AI integration."
      icon={Bot}
    />
  )
}
