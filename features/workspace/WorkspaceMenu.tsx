'use client'

import { Check, ChevronRight, Plus, Settings, UserPlus, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'

import type { WorkspaceUser } from './UserMenu'

interface WorkspaceMenuProps {
  user: WorkspaceUser
  onClose: () => void
}

const HINT_TIMEOUT_MS = 2200

/**
 * Content of the floating workspace popover: workspace header with
 * actions, upgrade CTA, credits usage, workspace switcher, and a create
 * CTA — Linear/Lovable-style OS menu.
 */
export function WorkspaceMenu({ user, onClose }: WorkspaceMenuProps) {
  const [hint, setHint] = useState<string | null>(null)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showHint = (message: string) => {
    setHint(message)
    if (hintTimer.current) clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setHint(null), HINT_TIMEOUT_MS)
  }

  const firstName = user.name?.split(' ')[0]
  const workspaceName = firstName ? `${firstName}'s Workspace` : 'My Workspace'
  const initial = (user.name ?? user.email ?? '?').charAt(0).toUpperCase()

  return (
    <div className="overflow-hidden rounded-2xl bg-[#0e0e12]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.06),0_32px_80px_-16px_rgba(0,0,0,0.9),0_8px_32px_-8px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
      {/* Workspace header */}
      <div className="m-1.5 rounded-xl bg-white/[0.04] p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-gradient text-base font-bold text-white shadow-[0_4px_16px_-4px_var(--accent)]">
            {initial}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-white">
              {workspaceName}
            </span>
            <span className="block text-xs text-white/40">Free Plan · 1 member</span>
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1 border-t border-white/[0.06] pt-2.5">
          <Link
            href="/settings"
            role="menuitem"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/65 transition-colors hover:bg-white/[0.07] hover:text-white"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => showHint('Team invites are coming soon')}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/65 transition-colors hover:bg-white/[0.07] hover:text-white"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite members
          </button>
        </div>
      </div>

      {/* Upgrade card */}
      <div className="mx-1.5 mb-1.5 flex items-center justify-between rounded-xl bg-white/[0.04] p-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
          <Zap className="h-4 w-4 text-accent" />
          Turn Pro
        </span>
        <button
          type="button"
          onClick={() => showHint('Pro plans are coming soon')}
          className="ease-spring rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_45%),linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-4 py-1.5 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_6px_20px_-6px_var(--accent)] transition-all duration-200 hover:scale-[1.03] hover:brightness-110 active:scale-[0.97]"
        >
          Upgrade
        </button>
      </div>

      {/* Credits card */}
      <div className="mx-1.5 mb-1.5 rounded-xl bg-white/[0.04] p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Credits</span>
          <span className="inline-flex items-center gap-1 text-xs text-white/50">
            Unlimited
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="h-full w-full rounded-full bg-accent-gradient opacity-80" />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[0.7rem] text-white/35">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
          Free unlimited generations during beta
        </p>
      </div>

      {/* Workspace switcher */}
      <div className="border-t border-white/[0.06] p-1.5">
        <p className="px-2.5 pb-1 pt-1.5 text-[0.68rem] font-medium text-white/35">
          All workspaces
        </p>
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent-gradient text-[0.65rem] font-bold text-white">
            {initial}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-white">{workspaceName}</span>
          <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-white/55">
            FREE
          </span>
          <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
        </div>
      </div>

      {/* Create workspace */}
      <div className="border-t border-white/[0.06] p-1.5">
        <button
          type="button"
          role="menuitem"
          onClick={() => showHint('Multiple workspaces are coming soon')}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.07]">
            <Plus className="h-3.5 w-3.5" />
          </span>
          Create new workspace
        </button>
      </div>

      {hint ? (
        <p className="border-t border-white/[0.06] px-3.5 py-2 text-[0.7rem] text-white/40" aria-live="polite">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
