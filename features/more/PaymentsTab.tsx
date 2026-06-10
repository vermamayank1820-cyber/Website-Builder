'use client'

import { CreditCard } from 'lucide-react'

export function PaymentsTab() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-raised">
        <CreditCard className="h-6 w-6 text-muted" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">Payments</h3>
        <p className="max-w-sm text-sm text-muted">Stripe integration coming soon.</p>
      </div>
    </div>
  )
}
