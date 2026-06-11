'use client'

import {
  ChevronDown,
  Clock,
  Compass,
  FolderOpen,
  Home,
  LayoutTemplate,
  LogOut,
  PanelLeft,
  Search,
  Settings,
  Star,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { LogoMark } from '@/components/ui/LogoMark'
import { Popover } from '@/components/ui/Popover'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { FeedTab, Project } from '@/types'
import { cn } from '@/utils/cn'

import type { WorkspaceUser } from './UserMenu'
import { WorkspaceMenu } from './WorkspaceMenu'

interface SidebarProps {
  user: WorkspaceUser
  /** Last opened projects, newest first (shown under "Recents"). */
  recentProjects: Project[]
  activeTab: FeedTab
  onNavigateHome: () => void
  onNavigateTab: (tab: FeedTab) => void
  onOpenSearch: () => void
  className?: string
}

const COLLAPSE_KEY = 'promptsite:sidebar-collapsed'
const MAX_RECENTS = 5

interface ItemProps {
  icon: ReactNode
  label: string
  collapsed: boolean
  isActive?: boolean
  trailing?: ReactNode
  onClick: () => void
}

function SidebarItem({ icon, label, collapsed, isActive, trailing, onClick }: ItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'ease-spring flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[0.82rem] font-medium transition-all duration-150',
        collapsed && 'justify-center px-0',
        isActive
          ? 'bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'text-white/55 hover:bg-white/[0.05] hover:text-white'
      )}
    >
      <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {!collapsed ? <span className="flex-1 truncate text-left">{label}</span> : null}
      {!collapsed && trailing ? <span className="shrink-0">{trailing}</span> : null}
    </button>
  )
}

function SectionLabel({ children, collapsed }: { children: ReactNode; collapsed: boolean }) {
  if (collapsed) return <div className="mx-auto my-2 h-px w-6 bg-white/[0.08]" />
  return (
    <p className="px-2.5 pb-1.5 pt-5 text-[0.65rem] font-semibold tracking-widest text-white/30 uppercase">
      {children}
    </p>
  )
}

/**
 * Persistent left navigation rail (260px / 72px collapsed). Anchors the
 * whole workspace: nav, project views, recents, upgrade CTA, profile.
 */
export function Sidebar({
  user,
  recentProjects,
  activeTab,
  onNavigateHome,
  onNavigateTab,
  onOpenSearch,
  className,
}: SidebarProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const workspaceTriggerRef = useRef<HTMLButtonElement>(null)
  const profileTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === '1')
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      window.localStorage.setItem(COLLAPSE_KEY, value ? '0' : '1')
      return !value
    })
  }

  const showHint = (message: string) => {
    setHint(message)
    setTimeout(() => setHint(null), 2200)
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await getSupabaseBrowserClient().auth.signOut()
      router.replace('/login')
    } catch {
      setIsSigningOut(false)
    }
  }

  const firstName = user.name?.split(' ')[0]
  const workspaceName = firstName ? `${firstName}'s Workspace` : 'My Workspace'
  const initial = (user.name ?? user.email ?? '?').charAt(0).toUpperCase()

  return (
    <aside
      className={cn(
        'sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0d]/85 backdrop-blur-2xl',
        'transition-[width] duration-300 ease-out',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        className
      )}
    >
      {/* Logo + collapse */}
      <div className={cn('flex items-center px-4 pb-2 pt-4', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed ? (
          <Link href="/workspace" className="flex items-center gap-2">
            <LogoMark sizeClassName="h-7 w-7 text-[0.8rem]" />
            <span className="text-sm font-semibold tracking-tight text-white">PromptSite</span>
          </Link>
        ) : null}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Workspace selector */}
      <div className="px-3 pt-1">
        <button
          ref={workspaceTriggerRef}
          type="button"
          onClick={() => setIsWorkspaceMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={isWorkspaceMenuOpen}
          title={collapsed ? workspaceName : undefined}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl p-2 transition-colors',
            'bg-white/[0.04] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-white/[0.07]',
            isWorkspaceMenuOpen && 'bg-white/[0.07] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]',
            collapsed && 'justify-center'
          )}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent-gradient text-[0.65rem] font-bold text-white">
            {initial}
          </span>
          {!collapsed ? (
            <>
              <span className="flex-1 truncate text-left text-[0.82rem] font-medium text-white">
                {workspaceName}
              </span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200',
                  isWorkspaceMenuOpen && 'rotate-180'
                )}
              />
            </>
          ) : null}
        </button>

        <Popover
          anchorRef={workspaceTriggerRef}
          isOpen={isWorkspaceMenuOpen}
          onClose={() => setIsWorkspaceMenuOpen(false)}
          placement="bottom-start"
          matchWidth
          minWidth={272}
          offset={6}
        >
          <WorkspaceMenu user={user} onClose={() => setIsWorkspaceMenuOpen(false)} />
        </Popover>
      </div>

      {/* Navigation */}
      <nav aria-label="Workspace navigation" className="mt-3 flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-0.5">
          <SidebarItem
            icon={<Home />}
            label="Home"
            collapsed={collapsed}
            isActive={activeTab === 'projects'}
            onClick={onNavigateHome}
          />
          <SidebarItem
            icon={<Search />}
            label="Search"
            collapsed={collapsed}
            trailing={
              <kbd className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[0.6rem] text-white/40">
                ⌘K
              </kbd>
            }
            onClick={onOpenSearch}
          />
          <SidebarItem
            icon={<LayoutTemplate />}
            label="Templates"
            collapsed={collapsed}
            isActive={activeTab === 'templates'}
            onClick={() => onNavigateTab('templates')}
          />
          <SidebarItem
            icon={<Compass />}
            label="Resources"
            collapsed={collapsed}
            onClick={() => showHint('Docs & guides are coming soon')}
          />
        </div>

        <SectionLabel collapsed={collapsed}>Projects</SectionLabel>
        <div className="space-y-0.5">
          <SidebarItem
            icon={<FolderOpen />}
            label="My Projects"
            collapsed={collapsed}
            isActive={activeTab === 'projects'}
            onClick={() => onNavigateTab('projects')}
          />
          <SidebarItem
            icon={<Star />}
            label="Starred"
            collapsed={collapsed}
            isActive={activeTab === 'starred'}
            onClick={() => onNavigateTab('starred')}
          />
          <SidebarItem
            icon={<Clock />}
            label="Recently Viewed"
            collapsed={collapsed}
            isActive={activeTab === 'recent'}
            onClick={() => onNavigateTab('recent')}
          />
        </div>

        {!collapsed && recentProjects.length > 0 ? (
          <>
            <SectionLabel collapsed={collapsed}>Recents</SectionLabel>
            <div className="space-y-0.5">
              {recentProjects.slice(0, MAX_RECENTS).map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="block truncate rounded-xl px-2.5 py-1.5 text-[0.8rem] text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  {project.title}
                </Link>
              ))}
            </div>
          </>
        ) : null}

        {hint ? (
          <p className="mt-4 px-2.5 text-[0.7rem] text-white/40" aria-live="polite">
            {hint}
          </p>
        ) : null}
      </nav>

      {/* Bottom: upgrade + profile */}
      <div className="space-y-2 border-t border-white/[0.06] p-3">
        <button
          type="button"
          onClick={() => showHint('Pro plans are coming soon')}
          title={collapsed ? 'Upgrade to Pro' : undefined}
          className={cn(
            'ease-spring flex w-full items-center gap-3 rounded-xl p-2.5 transition-all duration-150',
            'bg-white/[0.04] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-white/[0.07] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]',
            collapsed && 'justify-center p-2'
          )}
        >
          {!collapsed ? (
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[0.8rem] font-semibold text-white">Upgrade to Pro</span>
              <span className="block text-[0.68rem] text-white/40">Unlock more features</span>
            </span>
          ) : null}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-gradient shadow-[0_4px_16px_-4px_var(--accent)]">
            <Zap className="h-3.5 w-3.5 text-white" />
          </span>
        </button>

        <div>
          <button
            ref={profileTriggerRef}
            type="button"
            onClick={() => setIsProfileMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            title={collapsed ? (user.name ?? user.email) : undefined}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-white/[0.05]',
              isProfileMenuOpen && 'bg-white/[0.05]',
              collapsed && 'justify-center'
            )}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.08] text-xs font-semibold text-white">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" width={28} height={28} className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </span>
            {!collapsed ? (
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[0.8rem] font-medium text-white">
                  {user.name ?? 'Your account'}
                </span>
                <span className="block truncate text-[0.68rem] text-white/40">{user.email}</span>
              </span>
            ) : null}
          </button>

          <Popover
            anchorRef={profileTriggerRef}
            isOpen={isProfileMenuOpen}
            onClose={() => setIsProfileMenuOpen(false)}
            placement="top-start"
            matchWidth
            minWidth={224}
            offset={6}
          >
            <div
              role="menu"
              className="overflow-hidden rounded-xl bg-[#0e0e12]/95 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.06),0_24px_64px_-16px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
            >
              <div className="border-b border-white/[0.06] px-3 pb-2 pt-1.5">
                <p className="truncate text-xs font-medium text-white">{user.name ?? 'Your account'}</p>
                <p className="truncate text-[0.68rem] text-white/40">{user.email}</p>
              </div>
              <div className="pt-1">
                <Link
                  href="/settings"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleSignOut()}
                  disabled={isSigningOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {isSigningOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            </div>
          </Popover>
        </div>
      </div>
    </aside>
  )
}
