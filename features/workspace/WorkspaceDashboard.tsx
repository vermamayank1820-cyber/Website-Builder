'use client'

import { Clock, FolderOpen, Sparkles, Star } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LogoMark } from '@/components/ui/LogoMark'
import { Modal } from '@/components/ui/Modal'
import { AgentProgress } from '@/features/agent/AgentProgress'
import { useBusinessAgent } from '@/hooks/use-business-agent'
import {
  createProject,
  deleteProject,
  duplicateProject,
  listProjects,
  listRecentlyViewed,
  renameProject,
} from '@/lib/projects/service'
import { getStarredIds, toggleStarred } from '@/lib/projects/starred'
import { TEMPLATE_CATALOG } from '@/lib/templates/catalog'
import { useGeneratorStore } from '@/store/generator-store'
import type { FeedTab, Project, RecentlyViewedItem, Template } from '@/types'
import { cn } from '@/utils/cn'
import { relativeTime } from '@/utils/relative-time'

import { AtmosphereBackground } from './AtmosphereBackground'
import { EmptyState } from './EmptyState'
import { ProjectCard } from './ProjectCard'
import { PromptComposer } from './PromptComposer'
import { TopBar } from './TopBar'
import { SearchPalette } from './SearchPalette'
import { Sidebar } from './Sidebar'
import { TemplateCard } from './TemplateCard'
import { UserMenu, type WorkspaceUser } from './UserMenu'

interface WorkspaceDashboardProps {
  user: WorkspaceUser
  initialProjects: Project[]
  initialRecents: RecentlyViewedItem[]
}

const TABS: ReadonlyArray<{ id: FeedTab; label: string }> = [
  { id: 'projects', label: 'My Projects' },
  { id: 'starred', label: 'Starred' },
  { id: 'recent', label: 'Recently Viewed' },
  { id: 'templates', label: 'Templates' },
]

/**
 * Creation-first homepage: persistent sidebar, cinematic atmosphere
 * background, hero prompt composer, and a glass feed panel with inline
 * tabs for projects, starred, recents, and templates.
 */
export function WorkspaceDashboard({
  user,
  initialProjects,
  initialRecents,
}: WorkspaceDashboardProps) {
  const router = useRouter()
  const {
    launch,
    stages: agentStages,
    isRunning: isAgentRunning,
    error: agentError,
  } = useBusinessAgent()

  const resetStore = useGeneratorStore((state) => state.reset)

  const [activeTab, setActiveTab] = useState<FeedTab>('projects')
  const [projects, setProjects] = useState(initialProjects)
  const [recents, setRecents] = useState(initialRecents)
  const [starredIds, setStarredIds] = useState<ReadonlySet<string>>(new Set())
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const [renameTarget, setRenameTarget] = useState<Project | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [busyAction, setBusyAction] = useState(false)
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null)

  const feedRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setStarredIds(getStarredIds())
  }, [])

  // ⌘K / Ctrl+K opens the search palette anywhere on the page.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleGenerate = (prompt: string) => {
    // Clear any previously open project's state so the new conversation
    // starts clean before it's carried into the editor.
    resetStore()
    void launch(prompt)
  }

  const navigateTab = (tab: FeedTab) => {
    setActiveTab(tab)
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const navigateHome = () => {
    setActiveTab('projects')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const refresh = useCallback(async () => {
    try {
      const [nextProjects, nextRecents] = await Promise.all([
        listProjects(),
        listRecentlyViewed(),
      ])
      setProjects(nextProjects)
      setRecents(nextRecents)
    } catch (cause: unknown) {
      setActionError(cause instanceof Error ? cause.message : 'Failed to refresh projects')
    }
  }, [])

  const runAction = async (action: () => Promise<void>) => {
    setBusyAction(true)
    setActionError(null)
    try {
      await action()
      await refresh()
    } catch (cause: unknown) {
      setActionError(cause instanceof Error ? cause.message : 'Something went wrong')
    } finally {
      setBusyAction(false)
    }
  }

  const handleRenameSubmit = () =>
    void runAction(async () => {
      if (!renameTarget || !renameValue.trim()) return
      await renameProject(renameTarget.id, renameValue.trim())
      setRenameTarget(null)
    })

  const handleDeleteConfirm = () =>
    void runAction(async () => {
      if (!deleteTarget) return
      await deleteProject(deleteTarget.id)
      setDeleteTarget(null)
    })

  const handleDuplicate = (project: Project) =>
    void runAction(async () => {
      await duplicateProject(project.id)
    })

  const handleUseTemplate = async (template: Template) => {
    setCreatingTemplateId(template.id)
    setActionError(null)
    try {
      const project = await createProject({
        title: template.title,
        category: template.category,
        prompt: template.prompt,
        code: template.code,
        generationSummary: `Started from the ${template.title} template`,
        summaryData: null,
      })
      router.push(`/project/${project.id}`)
    } catch (cause: unknown) {
      setActionError(cause instanceof Error ? cause.message : 'Failed to create project')
      setCreatingTemplateId(null)
    }
  }

  const cardHandlers = {
    onToggleStar: (project: Project) => setStarredIds(toggleStarred(project.id)),
    onRename: (project: Project) => {
      setRenameTarget(project)
      setRenameValue(project.title)
    },
    onDuplicate: handleDuplicate,
    onDelete: (project: Project) => setDeleteTarget(project),
  }

  const starredProjects = projects.filter((project) => starredIds.has(project.id))
  const recentProjects = recents.map((item) => item.project)

  const projectGrid = (items: Project[], timeLabelFor?: (p: Project) => string) => (
    <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          timeLabel={timeLabelFor?.(project)}
          isStarred={starredIds.has(project.id)}
          {...cardHandlers}
        />
      ))}
    </div>
  )

  const tabCountLabel: Record<FeedTab, string> = {
    projects: `${projects.length} project${projects.length === 1 ? '' : 's'}`,
    starred: `${starredProjects.length} starred`,
    recent: `${recents.length} recent${recents.length === 1 ? '' : 's'}`,
    templates: `${TEMPLATE_CATALOG.length} templates`,
  }

  return (
    <div className="flex min-h-screen bg-[#050507]">
      <Sidebar
        user={user}
        recentProjects={recentProjects}
        activeTab={activeTab}
        onNavigateHome={navigateHome}
        onNavigateTab={navigateTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        className="hidden lg:flex"
      />

      <div className="relative min-w-0 flex-1">
        <AtmosphereBackground />

        {/* Mobile-only top bar (sidebar takes over on lg+) */}
        <header className="absolute inset-x-0 top-0 z-20 lg:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <Link href="/workspace" className="flex items-center gap-2.5">
              <LogoMark />
              <span className="text-sm font-semibold tracking-tight text-white">PromptSite</span>
            </Link>
            <UserMenu user={user} />
          </div>
        </header>

        {/* Desktop global top bar — model picker (left) + credits (right) */}
        <div className="absolute inset-x-0 top-0 z-20 hidden lg:block">
          <TopBar />
        </div>

        {/* Section 1 — creation hero */}
        <section
          aria-labelledby="hero-heading"
          className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pb-32 pt-20"
        >
          <h1
            id="hero-heading"
            className="max-w-2xl text-center text-[2.6rem] font-semibold leading-[1.06] tracking-[-0.035em] text-balance text-white sm:text-6xl"
          >
            What would you like to create today?
          </h1>
          <p className="mt-5 max-w-md text-center text-base text-white/50 sm:text-lg">
            Describe an idea, paste a link, or drop a file — PromptSite builds the rest.
          </p>

          <div className="mt-10 flex w-full justify-center">
            <PromptComposer
              isBusy={isAgentRunning}
              busyLabel="The Business Agent is working — analysis, strategy, then your website."
              error={agentError}
              onSubmit={handleGenerate}
              onTemplatesClick={() => navigateTab('templates')}
            />
          </div>

          {agentStages.length > 0 ? (
            <div className="mt-5 flex w-full justify-center">
              <AgentProgress stages={agentStages} />
            </div>
          ) : null}
        </section>

        {/* Section 2 — content feed */}
        <section
          ref={feedRef}
          aria-label="Your projects and templates"
          className="glass-panel relative z-10 mx-3 -mt-24 mb-4 scroll-mt-4 rounded-[28px] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_0_0_1px_rgba(255,255,255,0.045),0_-12px_48px_-24px_rgba(0,0,0,0.8)] sm:mx-5 sm:px-7 sm:py-7"
        >
          <div className="flex items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Workspace content"
              className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-white/[0.04] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
            >
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'ease-spring shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200',
                    activeTab === id
                      ? 'bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3)]'
                      : 'text-white/45 hover:text-white'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="hidden shrink-0 text-xs text-white/30 sm:block">
              {tabCountLabel[activeTab]}
            </p>
          </div>

          {actionError ? (
            <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {actionError}
            </p>
          ) : null}

          <div className="mt-7 min-h-[40vh]">
            {activeTab === 'projects' ? (
              projects.length === 0 ? (
                <EmptyState
                  icon={FolderOpen}
                  title="No projects yet"
                  description="Create your first website and it will appear here."
                  action={
                    <Button type="button" variant="gradient" onClick={navigateHome}>
                      <Sparkles className="h-4 w-4" />
                      Create Website
                    </Button>
                  }
                />
              ) : (
                projectGrid(projects)
              )
            ) : null}

            {activeTab === 'starred' ? (
              starredProjects.length === 0 ? (
                <EmptyState
                  icon={Star}
                  title="No starred projects"
                  description="Hover a project and tap the star to pin your favorites here."
                />
              ) : (
                projectGrid(starredProjects)
              )
            ) : null}

            {activeTab === 'recent' ? (
              recents.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No recently viewed projects"
                  description="Projects you open will appear here."
                />
              ) : (
                <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {recents.map((item) => (
                    <ProjectCard
                      key={item.id}
                      project={item.project}
                      timeLabel={`Viewed ${relativeTime(item.viewed_at)}`}
                      isStarred={starredIds.has(item.project.id)}
                      {...cardHandlers}
                    />
                  ))}
                </div>
              )
            ) : null}

            {activeTab === 'templates' ? (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {TEMPLATE_CATALOG.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isCreating={creatingTemplateId === template.id}
                    onUse={(t) => void handleUseTemplate(t)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <SearchPalette
        isOpen={isSearchOpen}
        projects={projects}
        onClose={() => setIsSearchOpen(false)}
      />

      <Modal
        title="Rename project"
        isOpen={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleRenameSubmit()
          }}
          className="space-y-4"
        >
          <Input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            placeholder="Project name"
            autoFocus
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busyAction || !renameValue.trim()}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Delete project"
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
      >
        <p className="text-sm leading-relaxed text-muted">
          Delete <span className="font-medium text-foreground">{deleteTarget?.title}</span> and
          all of its versions? This can&apos;t be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDeleteConfirm}
            disabled={busyAction}
            className="bg-red-500 hover:brightness-110"
          >
            Delete project
          </Button>
        </div>
      </Modal>
    </div>
  )
}
