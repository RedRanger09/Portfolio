'use client'

import Image from 'next/image'
import { SignOutButton, useUser } from '@clerk/nextjs'
import { LogOut, UserCircle } from 'lucide-react'

/**
 * Clerk-backed account section for the admin topbar. A client component
 * because `useUser()` is the supported way to read the live session on
 * the client for display (avatar, name, email) and `SignOutButton` is
 * Clerk's official sign-out control.
 */
export function AdminUserMenu() {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    return (
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-500"
      >
        <UserCircle className="h-4 w-4" />
      </span>
    )
  }

  if (!user) {
    return null
  }

  const displayName = user.fullName ?? user.username ?? 'Admin'
  const email = user.primaryEmailAddress?.emailAddress ?? ''
  const imageUrl = user.imageUrl

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-white">{displayName}</p>
        {email && <p className="text-xs text-zinc-500">{email}</p>}
      </div>

      <div className="flex items-center gap-2">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-full border border-white/[0.08] object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-500">
            <UserCircle className="h-4 w-4" aria-hidden="true" />
          </span>
        )}

        <SignOutButton>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/[0.08] px-3 text-xs font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
            <span className="sr-only sm:hidden">Sign out</span>
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}
