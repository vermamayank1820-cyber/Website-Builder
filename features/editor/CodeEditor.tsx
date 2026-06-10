'use client'

import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { openSearchPanel, search, searchKeymap } from '@codemirror/search'
import { Compartment, EditorState } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { Check, Copy, Download, Pencil, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/utils/cn'

interface CodeEditorProps {
  code: string
  onChange?: (code: string) => void
  filename?: string
  readOnly?: boolean
  className?: string
}

const TOOLBAR_BUTTON_CLASSES =
  'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground'

export function CodeEditor({ code, onChange, filename, readOnly = false, className }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editableCompartmentRef = useRef(new Compartment())
  const canEdit = Boolean(onChange) && !readOnly
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  const isEditable = canEdit && editing

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const view = new EditorView({
      state: EditorState.create({
        doc: code,
        extensions: [
          lineNumbers(),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
          javascript({ jsx: true, typescript: false }),
          search({ top: true }),
          oneDark,
          editableCompartmentRef.current.of([
            EditorState.readOnly.of(!isEditable),
            EditorView.editable.of(isEditable),
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current?.(update.state.doc.toString())
            }
          }),
          EditorView.theme({
            '&': { height: '100%', fontSize: '13px' },
            '.cm-scroller': { overflow: 'auto' },
          }),
        ],
      }),
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) {
      return
    }

    const currentCode = view.state.doc.toString()
    if (currentCode !== code) {
      view.dispatch({
        changes: { from: 0, to: currentCode.length, insert: code },
      })
    }
  }, [code])

  useEffect(() => {
    const view = viewRef.current
    if (!view) {
      return
    }

    view.dispatch({
      effects: editableCompartmentRef.current.reconfigure([
        EditorState.readOnly.of(!isEditable),
        EditorView.editable.of(isEditable),
      ]),
    })
  }, [isEditable])

  // Reset to read-only whenever the displayed file changes.
  useEffect(() => {
    setEditing(false)
  }, [filename])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename ?? 'Page.jsx'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSearch = () => {
    const view = viewRef.current
    if (view) openSearchPanel(view)
  }

  return (
    <div className={cn('flex h-full w-full flex-col overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-1.5">
        <span className="truncate text-xs font-medium text-muted">{filename ?? 'Page.jsx'}</span>
        <div className="flex items-center gap-1">
          {canEdit ? (
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className={cn(TOOLBAR_BUTTON_CLASSES, editing && 'text-foreground')}
              title={editing ? 'Switch to read-only' : 'Enable editing'}
            >
              <Pencil className="h-3.5 w-3.5" />
              {editing ? 'Editing' : 'Read-only'}
            </button>
          ) : null}
          <button type="button" onClick={handleSearch} className={TOOLBAR_BUTTON_CLASSES} title="Search">
            <Search className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={handleCopy} className={TOOLBAR_BUTTON_CLASSES} title="Copy code">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button type="button" onClick={handleDownload} className={TOOLBAR_BUTTON_CLASSES} title="Download file">
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1 overflow-hidden" />
    </div>
  )
}
