'use client'

import { Loader2, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { buildPreviewHtml } from '@/lib/preview/build-html'
import type { Template } from '@/types'
import { cn } from '@/utils/cn'

interface TemplateCardProps {
  template: Template
  isCreating: boolean
  onUse: (template: Template) => void
}

const PREVIEW_BASE_WIDTH = 1280
const PREVIEW_BASE_HEIGHT = 800

/**
 * Marketplace-style template tile: a large live-rendered (scaled-down)
 * preview with a hover overlay CTA, plus name/category/description below.
 * The iframe only mounts once the card scrolls into view.
 */
export function TemplateCard({ template, isCreating, onUse }: TemplateCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateScale = () => setScale(node.clientWidth / PREVIEW_BASE_WIDTH)
    updateScale()

    const resizeObserver = new ResizeObserver(updateScale)
    resizeObserver.observe(node)

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true)
          intersectionObserver.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    intersectionObserver.observe(node)

    return () => {
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
    }
  }, [])

  return (
    <div className="group">
      <div
        ref={containerRef}
        className={cn(
          'ease-spring relative aspect-[16/10] overflow-hidden rounded-2xl bg-white',
          'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_4px_16px_-8px_rgba(0,0,0,0.5)]',
          'transition-all duration-300',
          'group-hover:-translate-y-1.5 group-hover:scale-[1.01]',
          'group-hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16),0_32px_64px_-20px_rgba(0,0,0,0.9),0_12px_32px_-16px_rgba(139,92,246,0.25)]'
        )}
      >
        {isVisible && scale > 0 ? (
          <iframe
            title={`${template.title} template preview`}
            srcDoc={buildPreviewHtml(template.code)}
            sandbox="allow-scripts"
            loading="lazy"
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none origin-top-left border-0"
            style={{
              width: PREVIEW_BASE_WIDTH,
              height: PREVIEW_BASE_HEIGHT,
              transform: `scale(${scale})`,
            }}
          />
        ) : (
          <div className="h-full w-full animate-pulse bg-white/[0.04]" />
        )}

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[2px]',
            'opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100',
            isCreating && 'opacity-100'
          )}
        >
          <button
            type="button"
            onClick={() => onUse(template)}
            disabled={isCreating}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-xl transition-transform hover:scale-105 disabled:opacity-70"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isCreating ? 'Creating project…' : 'Use template'}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium tracking-tight">{template.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {template.description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 text-[0.68rem] font-medium text-muted">
          {template.category}
        </span>
      </div>
    </div>
  )
}
