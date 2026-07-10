'use client'

import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import { AdminField } from './admin-field'

interface StringListFieldProps {
  label: string
  name: string
  values: string[]
  onChange: (values: string[]) => void
  error?: string
  hint?: string
  placeholder?: string
  /** When true, shows move up/down controls for each row. */
  reorderable?: boolean
}

/** Reusable ordered string list editor for admin CMS forms. */
export function StringListField({
  label,
  name,
  values,
  onChange,
  error,
  hint,
  placeholder = 'Add item',
  reorderable = false,
}: StringListFieldProps) {
  function updateItem(index: number, value: string) {
    onChange(values.map((item, itemIndex) => (itemIndex === index ? value : item)))
  }

  function removeItem(index: number) {
    onChange(values.filter((_, itemIndex) => itemIndex !== index))
  }

  function addItem() {
    onChange([...values, ''])
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= values.length) return
    const next = [...values]
    const item = next[index]
    if (item === undefined) return
    next.splice(index, 1)
    next.splice(target, 0, item)
    onChange(next)
  }

  return (
    <AdminField label={label} name={name} error={error} hint={hint}>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            {reorderable ? (
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  className="inline-flex h-5 w-8 items-center justify-center rounded border border-white/[0.08] text-zinc-500 hover:text-white disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  aria-label={`Move ${label} item ${index + 1} up`}
                >
                  <ChevronUp className="h-3 w-3" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === values.length - 1}
                  className="inline-flex h-5 w-8 items-center justify-center rounded border border-white/[0.08] text-zinc-500 hover:text-white disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  aria-label={`Move ${label} item ${index + 1} down`}
                >
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ) : null}
            <input
              value={value}
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder={placeholder}
              className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label={`Remove ${label} item ${index + 1}`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-zinc-300 hover:border-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add item
        </button>
      </div>
    </AdminField>
  )
}
