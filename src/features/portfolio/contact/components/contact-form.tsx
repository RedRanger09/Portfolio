'use client'

import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { Loader2, Send } from 'lucide-react'
import { createContactMessage } from '@/features/messages/actions'
import { countWords, MAX_MESSAGE_WORDS } from '@/features/messages/lib/word-count'
import { cn } from '@/shared/utils'

const EMPTY_FORM = { name: '', email: '', message: '' }

/**
 * Minimal client contact form — submits via Server Action to `ContactMessage`.
 * Everything around it in `ContactSection` stays a Server Component.
 */
export function ContactForm() {
  const formId = useId()
  const nameId = `${formId}-name`
  const emailId = `${formId}-email`
  const messageId = `${formId}-message`
  const statusId = `${formId}-status`

  const [values, setValues] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)

  const wordCount = countWords(values.message)
  const wordsRemaining = Math.max(0, MAX_MESSAGE_WORDS - wordCount)
  const overWordLimit = wordCount > MAX_MESSAGE_WORDS

  useEffect(() => {
    if (success || formError) {
      statusRef.current?.focus()
    }
  }, [success, formError])

  function updateField<K extends keyof typeof EMPTY_FORM>(key: K, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
    setSuccess(false)
    setFormError(null)
  }

  function focusFirstError(errors: Record<string, string>) {
    if (errors.name) {
      nameRef.current?.focus()
      return
    }
    if (errors.email) {
      emailRef.current?.focus()
      return
    }
    if (errors.message) {
      messageRef.current?.focus()
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isPending) return

    setFieldErrors({})
    setFormError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await createContactMessage({
        name: values.name,
        email: values.email,
        message: values.message,
      })

      if (!result.success && result.error.type === 'VALIDATION') {
        const next: Record<string, string> = {}
        for (const [key, messages] of Object.entries(result.error.fieldErrors)) {
          if (messages[0]) next[key] = messages[0]
        }
        setFieldErrors(next)
        focusFirstError(next)
        return
      }

      if (!result.success) {
        setFormError(result.error.message || 'Something went wrong. Please try again.')
        return
      }

      setValues(EMPTY_FORM)
      setSuccess(true)
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-10 rounded-[1.75rem] border border-white/[0.08] bg-surface/70 p-6 shadow-card sm:p-8"
      aria-labelledby={`${formId}-heading`}
    >
      <div className="text-center sm:text-left">
        <h3 id={`${formId}-heading`} className="text-lg font-semibold tracking-tight text-white">
          Send a message
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          Prefer a form? Leave your name, email, and a short note — I&apos;ll get back to you.
        </p>
      </div>

      <div
        ref={statusRef}
        id={statusId}
        tabIndex={-1}
        aria-live="polite"
        aria-atomic="true"
        className="mt-4 outline-none"
      >
        {success ? (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300" role="status">
            Thanks — your message was sent. I&apos;ll reply as soon as I can.
          </p>
        ) : null}
        {formError ? (
          <p className="rounded-xl border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300" role="alert">
            {formError}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={nameId} className="block text-sm font-medium text-zinc-300">
            Name <span className="text-pink-400">*</span>
          </label>
          <input
            ref={nameRef}
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            disabled={isPending}
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? `${nameId}-error` : undefined}
            className={cn(
              'w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60',
              fieldErrors.name ? 'border-pink-500/40' : 'border-white/[0.08]',
            )}
            placeholder="Your name"
          />
          {fieldErrors.name ? (
            <p id={`${nameId}-error`} className="text-xs text-pink-400" role="alert">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={emailId} className="block text-sm font-medium text-zinc-300">
            Email <span className="text-pink-400">*</span>
          </label>
          <input
            ref={emailRef}
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={254}
            disabled={isPending}
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
            className={cn(
              'w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60',
              fieldErrors.email ? 'border-pink-500/40' : 'border-white/[0.08]',
            )}
            placeholder="you@example.com"
          />
          {fieldErrors.email ? (
            <p id={`${emailId}-error`} className="text-xs text-pink-400" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor={messageId} className="block text-sm font-medium text-zinc-300">
              Message <span className="text-pink-400">*</span>
            </label>
            <p
              id={`${messageId}-count`}
              className={cn('text-xs', overWordLimit ? 'text-pink-400' : 'text-zinc-500')}
              aria-live="polite"
            >
              {wordsRemaining} {wordsRemaining === 1 ? 'word' : 'words'} left
            </p>
          </div>
          <textarea
            ref={messageRef}
            id={messageId}
            name="message"
            rows={5}
            required
            maxLength={4000}
            disabled={isPending}
            value={values.message}
            onChange={(event) => updateField('message', event.target.value)}
            aria-invalid={Boolean(fieldErrors.message) || overWordLimit}
            aria-describedby={`${messageId}-count${fieldErrors.message ? ` ${messageId}-error` : ''}`}
            className={cn(
              'w-full resize-y rounded-xl border bg-background px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60',
              fieldErrors.message || overWordLimit ? 'border-pink-500/40' : 'border-white/[0.08]',
            )}
            placeholder="What would you like to say? (max 100 words)"
          />
          {fieldErrors.message ? (
            <p id={`${messageId}-error`} className="text-xs text-pink-400" role="alert">
              {fieldErrors.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-zinc-500">All fields are required. Max {MAX_MESSAGE_WORDS} words.</p>
        <button
          type="submit"
          disabled={isPending || overWordLimit}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/30 bg-gradient-cta px-5 text-sm font-medium text-white shadow-glow transition hover:bg-gradient-cta-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
          {isPending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  )
}
