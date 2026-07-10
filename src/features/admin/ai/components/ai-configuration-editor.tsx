'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { updateAiConfiguration } from '@/features/ai/actions'
import { applyFieldErrors, AdminBadge, AdminCard, AdminField, AdminTextInput, AdminTextarea } from '@/features/admin/shared'
import type { AiEditorValues } from '../types'

interface AiConfigurationEditorProps {
  initialValues: AiEditorValues
  apiConfigured: boolean
}

export function AiConfigurationEditor({ initialValues, apiConfigured }: AiConfigurationEditorProps) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function updateValue<K extends keyof AiEditorValues>(key: K, value: AiEditorValues[K]) {
    setValues((c) => ({ ...c, [key]: value }))
    setSaved(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setSaved(false)

    startTransition(async () => {
      const result = await updateAiConfiguration(values)
      if (applyFieldErrors(result, setFieldErrors)) return
      if (!result.success) { setFormError(result.error.message); return }
      setSaved(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <AdminBadge tone={apiConfigured ? 'success' : 'warning'}>API key {apiConfigured ? 'configured' : 'missing'}</AdminBadge>
        <AdminBadge tone="info">Chatbot not implemented</AdminBadge>
      </div>

      {formError && <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300" role="alert">{formError}</div>}
      {saved && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300" role="status">Configuration saved.</div>}

      <AdminCard as="section" aria-label="Provider and models">
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Provider" name="provider" error={fieldErrors.provider}><AdminTextInput id="provider" value={values.provider} onChange={(e) => updateValue('provider', e.target.value)} /></AdminField>
          <AdminField label="Chat model" name="chatModel" error={fieldErrors.chatModel}><AdminTextInput id="chatModel" value={values.chatModel} onChange={(e) => updateValue('chatModel', e.target.value)} /></AdminField>
          <AdminField label="Embedding model" name="embeddingModel" error={fieldErrors.embeddingModel}><AdminTextInput id="embeddingModel" value={values.embeddingModel} onChange={(e) => updateValue('embeddingModel', e.target.value)} /></AdminField>
          <AdminField label="Embedding dimensions" name="embeddingDimensions" error={fieldErrors.embeddingDimensions}><AdminTextInput id="embeddingDimensions" type="number" value={values.embeddingDimensions} onChange={(e) => updateValue('embeddingDimensions', Number(e.target.value))} /></AdminField>
          <AdminField label="Temperature" name="temperature" error={fieldErrors.temperature}><AdminTextInput id="temperature" type="number" step="0.1" min="0" max="2" value={values.temperature} onChange={(e) => updateValue('temperature', Number(e.target.value))} /></AdminField>
          <AdminField label="Max tokens" name="maxTokens" error={fieldErrors.maxTokens}><AdminTextInput id="maxTokens" type="number" value={values.maxTokens} onChange={(e) => updateValue('maxTokens', Number(e.target.value))} /></AdminField>
        </div>
      </AdminCard>

      <AdminCard as="section" aria-label="Prompt templates">
        <div className="grid gap-5">
          <AdminField label="System prompt" name="systemPrompt" error={fieldErrors.systemPrompt}><AdminTextarea id="systemPrompt" rows={5} value={values.systemPrompt} onChange={(e) => updateValue('systemPrompt', e.target.value)} /></AdminField>
          <AdminField label="Chatbot prompt" name="chatbotPrompt" error={fieldErrors.chatbotPrompt}><AdminTextarea id="chatbotPrompt" rows={5} value={values.chatbotPrompt} onChange={(e) => updateValue('chatbotPrompt', e.target.value)} /></AdminField>
        </div>
      </AdminCard>

      <button type="submit" disabled={isPending} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/30 bg-gradient-cta px-5 text-sm font-medium text-white disabled:opacity-60">
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Save configuration
      </button>
    </form>
  )
}
