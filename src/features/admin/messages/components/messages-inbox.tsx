'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Inbox, Mail } from 'lucide-react'
import { deleteContactMessage, updateContactMessageStatus } from '@/features/messages/actions'
import { AdminBadge, AdminCard, AdminConfirmDialog, AdminPagination, AdminSearchInput, AdminSelect, ADMIN_PAGE_SIZE, EmptyState, SectionTitle } from '@/features/admin/shared'
import type { AdminMessageListItem, MessageFilterKey } from '../types'

interface MessagesInboxProps {
  messages: AdminMessageListItem[]
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All messages' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' },
] as const

function statusTone(status: AdminMessageListItem['status']) {
  if (status === 'UNREAD') return 'info' as const
  if (status === 'ARCHIVED') return 'neutral' as const
  return 'success' as const
}

export function MessagesInbox({ messages: initialMessages }: MessagesInboxProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<MessageFilterKey>('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(initialMessages[0]?.id ?? null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => { setMessages(initialMessages) }, [initialMessages])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return messages.filter((m) => {
      if (filter === 'unread' && m.status !== 'UNREAD') return false
      if (filter === 'read' && m.status !== 'READ') return false
      if (filter === 'archived' && m.status !== 'ARCHIVED') return false
      if (!q) return true
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.body.toLowerCase().includes(q)
    })
  }, [messages, search, filter])

  const totalPages = Math.max(1, Math.ceil(visible.length / ADMIN_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = visible.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE)
  const selected = messages.find((m) => m.id === selectedId) ?? paged[0] ?? null

  function updateStatus(id: string, status: AdminMessageListItem['status']) {
    startTransition(async () => {
      const result = await updateContactMessageStatus({ id, status })
      if (!result.success) return
      setMessages((cur) => cur.map((m) => (m.id === id ? { ...m, status } : m)))
    })
  }

  function handleDelete() {
    if (!selected) return
    startTransition(async () => {
      const result = await deleteContactMessage({ id: selected.id })
      if (!result.success) return
      setDeleteOpen(false)
      setMessages((cur) => cur.filter((m) => m.id !== selected.id))
      setSelectedId(null)
    })
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Messages" description="Contact form submissions — read, archive, and manage inbound messages." />

      {messages.length === 0 ? (
        <EmptyState icon={Inbox} title="No messages yet" description="Inbound contact form submissions will appear here." />
      ) : (
        <>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
            <AdminSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search by name, email, or subject" />
            <AdminSelect label="Filter" value={filter} onChange={(v) => { setFilter(v as MessageFilterKey); setPage(1) }} options={FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <AdminCard padded={false}>
              <ul className="divide-y divide-white/[0.06]">
                {paged.map((message) => (
                  <li key={message.id}>
                    <button type="button" onClick={() => setSelectedId(message.id)} className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-white/[0.03] ${selected?.id === message.id ? 'bg-white/[0.04]' : ''}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-white">{message.subject}</span>
                        <AdminBadge tone={statusTone(message.status)}>{message.status.toLowerCase()}</AdminBadge>
                      </div>
                      <span className="truncate text-xs text-zinc-500">{message.name} · {message.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/[0.08] px-4 py-3">
                <AdminPagination page={currentPage} totalPages={totalPages} totalItems={visible.length} onPageChange={setPage} />
              </div>
            </AdminCard>

            <AdminCard>
              {selected ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{selected.subject}</h2>
                      <p className="mt-1 text-sm text-zinc-400">{selected.name} · <a href={`mailto:${selected.email}`} className="text-primary hover:text-primary-hover">{selected.email}</a></p>
                      <p className="mt-1 text-xs text-zinc-500">{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(selected.createdAt))}</p>
                    </div>
                    <Mail className="h-5 w-5 shrink-0 text-zinc-500" aria-hidden="true" />
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{selected.body}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selected.status !== 'READ' && <button type="button" disabled={isPending} onClick={() => updateStatus(selected.id, 'READ')} className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-zinc-300 hover:border-white/20">Mark read</button>}
                    {selected.status !== 'UNREAD' && <button type="button" disabled={isPending} onClick={() => updateStatus(selected.id, 'UNREAD')} className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-zinc-300 hover:border-white/20">Mark unread</button>}
                    {selected.status !== 'ARCHIVED' && <button type="button" disabled={isPending} onClick={() => updateStatus(selected.id, 'ARCHIVED')} className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-zinc-300 hover:border-white/20">Archive</button>}
                    <button type="button" disabled={isPending} onClick={() => setDeleteOpen(true)} className="rounded-lg border border-pink-500/30 px-3 py-1.5 text-xs text-pink-300 hover:border-pink-500/50">Delete</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">Select a message to read.</p>
              )}
            </AdminCard>
          </div>

          <AdminConfirmDialog open={deleteOpen} title="Delete message?" description="This message will be permanently removed." confirmLabel="Delete" loading={isPending} onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)} />
        </>
      )}
    </div>
  )
}
