'use client'

import { Cloud as CloudIcon, Hammer, History, Rocket } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import type { GenerationStatus } from '@/types'

interface CloudTabProps {
  status: GenerationStatus
  lastGeneratedAt: number | null
}

const BUILD_STATUS_LABEL: Record<GenerationStatus, string> = {
  idle: 'Not started',
  generating: 'Building…',
  streaming: 'Building…',
  ready: 'Ready',
  error: 'Failed',
}

export function CloudTab({ status, lastGeneratedAt }: CloudTabProps) {
  const buildStatus = BUILD_STATUS_LABEL[status]

  return (
    <div className="space-y-6 px-6 py-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-raised">
          <CloudIcon className="h-4 w-4 text-muted" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Cloud</h3>
          <p className="mt-0.5 text-sm text-muted">Build and deployment status for this page.</p>
        </div>
      </div>

      <div className="space-y-3">
        <InfoRow
          icon={History}
          label="Last generated"
          value={lastGeneratedAt ? new Date(lastGeneratedAt).toLocaleString() : 'Not yet generated'}
        />
        <InfoRow icon={Hammer} label="Build status" value={buildStatus} />
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised p-3">
          <div className="flex items-center gap-3">
            <Rocket className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Deployment</p>
              <p className="mt-0.5 text-sm text-muted">Not deployed</p>
            </div>
          </div>
          <Button type="button" variant="secondary" disabled title="Deployment isn't available yet">
            Deploy
          </Button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof History
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised p-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-sm text-muted">{value}</p>
      </div>
    </div>
  )
}
