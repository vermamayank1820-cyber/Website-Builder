'use client'

import { PromptComposer } from '@/features/workspace/PromptComposer'
import { TopBar } from '@/features/workspace/TopBar'

/**
 * Public harness for the workspace UI redesign (the authed /workspace isn't
 * reachable headless). Not part of the product surface.
 */
export default function UiDemoPage() {
  return (
    <main className="relative flex min-h-screen flex-col">
      {/* ambient midnight glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh]"
        style={{
          background:
            'radial-gradient(55% 60% at 50% 0%, rgba(99,102,241,0.09), transparent 70%)',
        }}
      />
      <TopBar showLogo />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-balance text-[2.7rem] font-semibold leading-[1.04] tracking-[-0.035em] text-foreground">
            What would you like to create?
          </h1>
          <p className="mx-auto mt-3.5 max-w-md text-[1rem] text-white/40">
            Describe an idea, paste a link, or drop a file — PromptSite builds the rest.
          </p>
          <div className="mt-10 flex justify-center">
            <PromptComposer
              isBusy={false}
              error={null}
              onSubmit={() => {}}
              onTemplatesClick={() => {}}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
