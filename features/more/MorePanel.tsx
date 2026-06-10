'use client'

import { BarChart3, Cloud, CreditCard, Search, Shield } from 'lucide-react'
import { useState } from 'react'

import type { GenerationStatus, PageSection } from '@/types'
import { cn } from '@/utils/cn'

import { AnalyticsTab } from './AnalyticsTab'
import { CloudTab } from './CloudTab'
import { PaymentsTab } from './PaymentsTab'
import { SecurityTab } from './SecurityTab'
import { SeoTab } from './SeoTab'

interface MorePanelProps {
  prompt: string
  code: string
  sections: PageSection[]
  status: GenerationStatus
  lastGeneratedAt: number | null
}

const SUB_TABS = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'seo', label: 'SEO & AI search', icon: Search },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'cloud', label: 'Cloud', icon: Cloud },
  { id: 'payments', label: 'Payments', icon: CreditCard },
] as const

type SubTab = (typeof SUB_TABS)[number]['id']

export function MorePanel({ prompt, code, sections, status, lastGeneratedAt }: MorePanelProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('analytics')

  return (
    <div className="flex h-full w-full overflow-hidden">
      <nav className="w-48 shrink-0 border-r border-border bg-surface p-2 sm:w-56">
        {SUB_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
              activeTab === id
                ? 'bg-surface-overlay text-foreground'
                : 'text-muted hover:bg-white/5 hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </nav>
      <div className="min-h-0 flex-1 overflow-y-auto bg-background">
        {activeTab === 'analytics' ? <AnalyticsTab /> : null}
        {activeTab === 'seo' ? <SeoTab prompt={prompt} sections={sections} /> : null}
        {activeTab === 'security' ? <SecurityTab code={code} /> : null}
        {activeTab === 'cloud' ? <CloudTab status={status} lastGeneratedAt={lastGeneratedAt} /> : null}
        {activeTab === 'payments' ? <PaymentsTab /> : null}
      </div>
    </div>
  )
}
