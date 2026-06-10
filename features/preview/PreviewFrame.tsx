'use client'

import { useMemo } from 'react'

import { buildPreviewHtml } from '@/lib/preview/build-html'

interface PreviewFrameProps {
  code: string
}

export function PreviewFrame({ code }: PreviewFrameProps) {
  const srcDoc = useMemo(() => buildPreviewHtml(code), [code])

  return (
    <iframe
      title="Live preview"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      className="h-full w-full border-0 bg-white"
    />
  )
}
