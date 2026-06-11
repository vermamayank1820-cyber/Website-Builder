'use client'

import { useEffect, useState } from 'react'

import { LogoMark } from '@/components/ui/LogoMark'

const STAGE_INTERVAL_MS = 1100

interface WorkspaceLoaderProps {
  /** Staged status lines, advanced automatically every ~1s. */
  stages?: string[]
}

const DEFAULT_STAGES = ['Preparing your workspace…', 'Loading projects…']

/**
 * Full-screen branded loading state shown while transitioning into the
 * workspace (post-login and route-level loading).
 */
export function WorkspaceLoader({ stages = DEFAULT_STAGES }: WorkspaceLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (stageIndex >= stages.length - 1) return
    const timer = setTimeout(() => setStageIndex((i) => i + 1), STAGE_INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [stageIndex, stages.length])

  return (
    <div className="bg-glow fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background">
      <div className="relative">
        <div className="absolute -inset-4 animate-pulse rounded-3xl bg-accent/20 blur-2xl" />
        <LogoMark sizeClassName="h-14 w-14 rounded-2xl text-2xl" className="relative" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p
          key={stageIndex}
          className="animate-pulse text-sm font-medium text-muted"
          aria-live="polite"
        >
          {stages[Math.min(stageIndex, stages.length - 1)]}
        </p>
        <div className="h-0.5 w-36 overflow-hidden rounded-full bg-surface-overlay">
          <div
            className="h-full rounded-full bg-accent-gradient transition-all duration-700 ease-out"
            style={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
