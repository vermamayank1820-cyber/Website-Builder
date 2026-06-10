'use client'

import { CheckCircle2, Info, Shield, XCircle } from 'lucide-react'
import { useMemo } from 'react'

interface SecurityTabProps {
  code: string
}

interface SecurityCheck {
  label: string
  description: string
  status: 'pass' | 'fail' | 'info'
}

export function SecurityTab({ code }: SecurityTabProps) {
  const checks = useMemo<SecurityCheck[]>(() => {
    const usesDangerousHtml = code.includes('dangerouslySetInnerHTML')

    return [
      {
        label: 'Sandboxed preview',
        description: 'The live preview renders inside an iframe with sandbox="allow-scripts" — no same-origin access.',
        status: 'pass',
      },
      {
        label: 'No dangerouslySetInnerHTML',
        description: usesDangerousHtml
          ? 'The generated code uses dangerouslySetInnerHTML — review it before publishing.'
          : 'The generated code does not inject raw HTML.',
        status: usesDangerousHtml ? 'fail' : 'pass',
      },
      {
        label: 'Content Security Policy',
        description: 'Not configured for generated previews — add a CSP if you deploy this page.',
        status: 'info',
      },
    ]
  }, [code])

  return (
    <div className="space-y-6 px-6 py-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-raised">
          <Shield className="h-4 w-4 text-muted" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Security</h3>
          <p className="mt-0.5 text-sm text-muted">A quick look at how the generated page is sandboxed.</p>
        </div>
      </div>

      <div className="space-y-3">
        {checks.map((check) => (
          <div key={check.label} className="flex gap-3 rounded-xl border border-border bg-surface-raised p-3">
            <StatusIcon status={check.status} />
            <div>
              <p className="text-sm font-medium text-foreground">{check.label}</p>
              <p className="mt-0.5 text-sm text-muted">{check.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: SecurityCheck['status'] }) {
  if (status === 'pass') return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
  if (status === 'fail') return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
  return <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
}
