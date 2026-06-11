'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { LogoMark } from '@/components/ui/LogoMark'
import { WorkspaceLoader } from '@/components/ui/WorkspaceLoader'

import { AuthCard } from './AuthCard'
import { BrandPanel } from './BrandPanel'

interface LoginScreenProps {
  nextPath: string
  initialError?: string
}

const REDIRECT_DELAY_MS = 1800

/**
 * Split-screen login: brand panel on the left, auth card on the right.
 * After authentication it shows the branded workspace loader, then
 * redirects into the workspace.
 */
export function LoginScreen({ nextPath, initialError }: LoginScreenProps) {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleAuthenticated = () => {
    setIsTransitioning(true)
    router.prefetch(nextPath)
    // Brief branded moment ("Preparing your workspace…") before landing.
    setTimeout(() => router.replace(nextPath), REDIRECT_DELAY_MS)
  }

  if (isTransitioning) {
    return <WorkspaceLoader />
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

      <div className="relative flex flex-col items-center justify-center px-6 py-16">
        {/* Mobile-only brand header */}
        <div className="mb-10 flex items-center gap-2.5 lg:hidden">
          <LogoMark />
          <span className="text-sm font-semibold tracking-tight">PromptSite</span>
        </div>

        <AuthCard
          nextPath={nextPath}
          initialError={initialError}
          onAuthenticated={handleAuthenticated}
        />

        <p className="mt-10 max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
          By continuing you agree to the PromptSite Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  )
}
