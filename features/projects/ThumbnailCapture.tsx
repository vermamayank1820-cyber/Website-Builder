'use client'

import { useEffect, useMemo, useRef } from 'react'

import { buildCaptureHtml } from '@/lib/preview/build-capture-html'

interface ThumbnailCaptureProps {
  code: string
  /** Changing this value triggers a fresh capture of the current code. */
  captureKey: number | string
  onCapture: (dataUrl: string) => void
  onError?: () => void
}

const CAPTURE_TIMEOUT_MS = 15_000

/**
 * Invisible offscreen iframe that renders the generated page at desktop
 * width, screenshots it via html2canvas (inside the sandbox), and reports
 * the JPEG data URL back through postMessage. Unmounts-safe and
 * single-shot per captureKey.
 */
export function ThumbnailCapture({
  code,
  captureKey,
  onCapture,
  onError,
}: ThumbnailCaptureProps) {
  const srcDoc = useMemo(() => buildCaptureHtml(code), [code])
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const handledRef = useRef(false)
  const onCaptureRef = useRef(onCapture)
  const onErrorRef = useRef(onError)

  onCaptureRef.current = onCapture
  onErrorRef.current = onError

  useEffect(() => {
    handledRef.current = false

    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our own capture iframe.
      if (event.source !== iframeRef.current?.contentWindow) return
      if (handledRef.current) return

      if (event.data?.type === 'promptsite:thumbnail' && typeof event.data.dataUrl === 'string') {
        handledRef.current = true
        onCaptureRef.current(event.data.dataUrl)
      } else if (event.data?.type === 'promptsite:thumbnail-error') {
        handledRef.current = true
        onErrorRef.current?.()
      }
    }

    const timeout = setTimeout(() => {
      if (!handledRef.current) {
        handledRef.current = true
        onErrorRef.current?.()
      }
    }, CAPTURE_TIMEOUT_MS)

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
      clearTimeout(timeout)
    }
  }, [captureKey])

  return (
    <iframe
      key={captureKey}
      ref={iframeRef}
      title="Thumbnail capture"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      aria-hidden
      tabIndex={-1}
      className="pointer-events-none fixed -left-[2000px] top-0 h-[800px] w-[1280px] opacity-0"
    />
  )
}
