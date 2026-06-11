'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/utils/cn'

type PopoverPlacement = 'bottom-start' | 'top-start'

interface PopoverProps {
  /** The element the popover is anchored to (also exempt from outside-click). */
  anchorRef: RefObject<HTMLElement | null>
  isOpen: boolean
  onClose: () => void
  placement?: PopoverPlacement
  /** Match the anchor's width (never narrower than minWidth). */
  matchWidth?: boolean
  /** Lower bound for the popover width in px. */
  minWidth?: number
  /** Gap between anchor and popover in px. */
  offset?: number
  className?: string
  children: ReactNode
}

/**
 * Floating popover primitive: rendered through a portal on document.body
 * with fixed positioning measured from the anchor, so it never sits in
 * the layout flow, never shifts content, and floats above everything.
 * Opens with a scale + fade transition from the anchor edge.
 */
export function Popover({
  anchorRef,
  isOpen,
  onClose,
  placement = 'bottom-start',
  matchWidth = false,
  minWidth = 0,
  offset = 8,
  className,
  children,
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Position against the live anchor rect; track resize and any scroll.
  useLayoutEffect(() => {
    if (!isOpen) {
      setStyle(null)
      return
    }

    const update = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (!rect) return

      const width = matchWidth ? Math.max(rect.width, minWidth) : undefined
      const next: CSSProperties = {
        position: 'fixed',
        left: rect.left,
        width,
        minWidth: width ? undefined : minWidth || undefined,
      }
      if (placement === 'bottom-start') {
        next.top = rect.bottom + offset
      } else {
        next.bottom = window.innerHeight - rect.top + offset
      }
      setStyle(next)
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [isOpen, anchorRef, placement, matchWidth, minWidth, offset])

  // Enter animation on the frame after mount.
  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false)
      return
    }
    const frame = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [isOpen])

  // Outside click + Escape.
  useEffect(() => {
    if (!isOpen) return

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (popoverRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      onClose()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, anchorRef])

  if (!isOpen || !style || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={popoverRef}
      style={style}
      className={cn(
        'z-[100] transition-[opacity,transform] duration-150 ease-out',
        placement === 'bottom-start' ? 'origin-top-left' : 'origin-bottom-left',
        isVisible
          ? 'translate-y-0 scale-100 opacity-100'
          : cn('scale-[0.96] opacity-0', placement === 'bottom-start' ? '-translate-y-1' : 'translate-y-1'),
        className
      )}
    >
      {children}
    </div>,
    document.body
  )
}
