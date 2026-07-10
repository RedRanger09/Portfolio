'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/shared/utils'

interface AdminFieldProps {
  label: string
  name: string
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function AdminField({ label, name, error, hint, children, className }: AdminFieldProps) {
  const errorId = error ? `${name}-error` : undefined
  const hintId = hint ? `${name}-hint` : undefined

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-300">
        {label}
      </label>
      {children}
      {hint && (
        <p id={hintId} className="text-xs text-zinc-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-pink-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface AdminTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export function AdminTextInput({ hasError, className, ...props }: AdminTextInputProps) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-lg border bg-background px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        hasError ? 'border-pink-500/40' : 'border-white/[0.08]',
        className,
      )}
    />
  )
}

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

export function AdminTextarea({ hasError, className, ...props }: AdminTextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full rounded-lg border bg-background px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        hasError ? 'border-pink-500/40' : 'border-white/[0.08]',
        className,
      )}
    />
  )
}

interface AdminConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Accessible confirmation dialog for destructive admin actions. */
export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  loading = false,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 motion-reduce:transition-none" role="presentation">
      <div role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title" aria-describedby="admin-confirm-description" className="w-full max-w-md rounded-xl border border-white/[0.08] bg-surface p-6 shadow-card">
        <h2 id="admin-confirm-title" className="text-lg font-semibold text-white">
          {title}
        </h2>
        <p id="admin-confirm-description" className="mt-2 text-sm text-zinc-500">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex min-h-9 items-center rounded-lg border border-white/[0.08] px-4 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex min-h-9 items-center rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 text-sm font-medium text-pink-300 transition hover:border-pink-500/50 hover:text-pink-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 disabled:opacity-60"
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
