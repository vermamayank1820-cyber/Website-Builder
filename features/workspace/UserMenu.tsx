'use client'

import { LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface WorkspaceUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}

interface UserMenuProps {
  user: WorkspaceUser
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await getSupabaseBrowserClient().auth.signOut()
      router.replace('/login')
    } catch {
      setIsSigningOut(false)
    }
  }

  const initial = (user.name ?? user.email ?? '?').charAt(0).toUpperCase()

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised text-sm font-semibold transition-all hover:border-border-strong hover:ring-2 hover:ring-accent/20"
      >
        {user.avatarUrl ? (
          // Supabase/Google avatar hosts vary — plain img avoids next/image domain config.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" width={36} height={36} className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-11 z-30 w-60 overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)]"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium">{user.name ?? 'Your account'}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <div className="p-1.5">
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
