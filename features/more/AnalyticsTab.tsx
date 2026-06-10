'use client'

import { BarChart3 } from 'lucide-react'

import { Button } from '@/components/ui/Button'

export function AnalyticsTab() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-raised">
        <BarChart3 className="h-6 w-6 text-muted" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">No analytics yet</h3>
        <p className="max-w-sm text-sm text-muted">
          To view analytics, you first need to publish your project.
        </p>
      </div>
      <Button type="button" variant="secondary" disabled title="Publishing isn't available yet">
        Publish
      </Button>
    </div>
  )
}
