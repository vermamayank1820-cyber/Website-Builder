'use client'

import { ExternalLink, Globe, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { buildPreviewHtml } from '@/lib/preview/build-html'
import type { PageRoute } from '@/types'
import { cn } from '@/utils/cn'

interface BrowserPreviewProps {
  code: string
  routes: PageRoute[]
  className?: string
}

const ICON_BUTTON_CLASSES =
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground'

export function BrowserPreview({ code, routes, className }: BrowserPreviewProps) {
  const [routePath, setRoutePath] = useState(routes[0]?.path ?? '/')
  const [reloadKey, setReloadKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const srcDoc = useMemo(() => buildPreviewHtml(code), [code])

  useEffect(() => {
    if (!routes.some((route) => route.path === routePath)) {
      setRoutePath(routes[0]?.path ?? '/')
    }
  }, [routes, routePath])

  const activeRoute = routes.find((route) => route.path === routePath) ?? routes[0]

  const scrollToRoute = (route: PageRoute | undefined) => {
    if (!route) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'promptsite:scroll', index: route.sectionIndex },
      '*'
    )
  }

  const handleRouteChange = (path: string) => {
    setRoutePath(path)
    scrollToRoute(routes.find((route) => route.path === path))
  }

  const handleRefresh = () => {
    setReloadKey((key) => key + 1)
  }

  const handleOpenInNewTab = () => {
    const blob = new Blob([srcDoc], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  return (
    <div className={cn('flex h-full w-full flex-col overflow-hidden', className)}>
      <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2">
        <button type="button" onClick={handleRefresh} className={ICON_BUTTON_CLASSES} title="Refresh preview">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1.5">
          <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-xs text-muted">
            yoursite.app{activeRoute && activeRoute.path !== '/' ? activeRoute.path : ''}
          </span>
        </div>

        {routes.length > 1 ? (
          <select
            value={routePath}
            onChange={(event) => handleRouteChange(event.target.value)}
            className="shrink-0 rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-xs text-muted transition-colors hover:text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {routes.map((route) => (
              <option key={route.path} value={route.path}>
                {route.label}
              </option>
            ))}
          </select>
        ) : null}

        <button
          type="button"
          onClick={handleOpenInNewTab}
          className={ICON_BUTTON_CLASSES}
          title="Open in new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-surface p-3 sm:p-4">
        <div className="h-full w-full overflow-hidden rounded-2xl border border-border shadow-[0_24px_64px_-32px_rgba(0,0,0,0.9)]">
          <iframe
            key={reloadKey}
            ref={iframeRef}
            title="Live preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className="h-full w-full border-0 bg-white transition-opacity duration-300 ease-out"
            onLoad={() => scrollToRoute(activeRoute)}
          />
        </div>
      </div>
    </div>
  )
}
