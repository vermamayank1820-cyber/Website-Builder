'use client'

import { AlertCircle, Check, Loader2 } from 'lucide-react'

import type { AgentStage } from '@/hooks/use-business-agent'
import { cn } from '@/utils/cn'

interface AgentProgressProps {
  stages: AgentStage[]
}

/**
 * Live view of a Business Agent run: each planned stage with its status,
 * shown beneath the composer while the system understands, plans, and
 * executes.
 */
export function AgentProgress({ stages }: AgentProgressProps) {
  if (stages.length === 0) return null

  return (
    <div className="glass-card w-full max-w-md rounded-2xl p-2" aria-live="polite">
      <p className="px-3 pb-1 pt-2 text-[0.65rem] font-semibold tracking-widest text-white/35 uppercase">
        Business Agent
      </p>
      <ol className="space-y-0.5">
        {stages.map((stage) => (
          <li
            key={stage.id}
            className={cn(
              'flex items-start gap-3 rounded-xl px-3 py-2 transition-colors duration-300',
              stage.status === 'active' && 'bg-white/[0.05]'
            )}
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
              {stage.status === 'done' ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : stage.status === 'active' ? (
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
              ) : stage.status === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-400" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              )}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  'block text-sm',
                  stage.status === 'pending' ? 'text-white/35' : 'text-white'
                )}
              >
                {stage.label}
              </span>
              {stage.detail ? (
                <span
                  className={cn(
                    'block truncate text-xs',
                    stage.status === 'error' ? 'text-red-400/80' : 'text-white/35'
                  )}
                >
                  {stage.detail}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
