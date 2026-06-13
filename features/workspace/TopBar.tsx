'use client'

import { LogoMark } from '@/components/ui/LogoMark'

import { CreditsPill } from './CreditsPill'
import { ModelPicker } from './ModelPicker'

/**
 * Minimal global top bar for the workspace: the model picker lives here (left),
 * never inside the composer; credits sit on the right. Quiet and lightweight.
 */
export function TopBar({ showLogo = false }: { showLogo?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div className="flex items-center gap-2">
        {showLogo ? <LogoMark sizeClassName="h-7 w-7 text-[0.78rem]" /> : null}
        <ModelPicker />
      </div>
      <CreditsPill />
    </div>
  )
}
