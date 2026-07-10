import type { Metadata } from 'next'
import { SectionTitle } from '@/features/admin/shared'
import { getAiConfigurationForAdmin, getAiApiStatus, AiConfigurationEditor, mapAiRowToEditorValues } from '@/features/admin/ai'

export const metadata: Metadata = { title: 'AI' }

export default async function AdminAiPage() {
  const config = await getAiConfigurationForAdmin()
  const apiStatus = getAiApiStatus()

  return (
    <div className="space-y-6">
      <SectionTitle title="AI" description="Configure the AI assistant — provider, models, and prompt templates. The chatbot UI is not implemented yet." />
      <AiConfigurationEditor initialValues={mapAiRowToEditorValues(config)} apiConfigured={apiStatus.configured} />
    </div>
  )
}
