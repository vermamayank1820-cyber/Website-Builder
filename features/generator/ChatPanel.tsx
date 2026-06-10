'use client'

import { CheckCircle2, Code2, Loader2, MessageSquare, XCircle } from 'lucide-react'

import type { ChatMessage } from '@/types'
import { cn } from '@/utils/cn'

import { RefineBar } from './RefineBar'

interface ChatPanelProps {
  messages: ChatMessage[]
  isLoading: boolean
  className?: string
  onRefine: (instruction: string) => void
  onViewCode: () => void
}

export function ChatPanel({ messages, isLoading, className, onRefine, onViewCode }: ChatPanelProps) {
  return (
    <div className={cn('flex-col overflow-hidden border-border bg-background lg:flex', className)}>
      <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2">
        <MessageSquare className="h-3.5 w-3.5 text-muted" />
        <span className="text-xs font-medium text-muted">Conversation</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} onViewCode={onViewCode} />
        ))}
      </div>
      <div className="border-t border-border bg-surface p-3">
        <RefineBar isLoading={isLoading} onSubmit={onRefine} />
      </div>
    </div>
  )
}

function ChatBubble({ message, onViewCode }: { message: ChatMessage; onViewCode: () => void }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-surface-overlay px-3.5 py-2 text-sm text-foreground">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[95%] space-y-2">
      <p className="text-sm leading-relaxed text-muted">{message.content}</p>
      {message.card ? <ChatCard card={message.card} onViewCode={onViewCode} /> : null}
    </div>
  )
}

function ChatCard({
  card,
  onViewCode,
}: {
  card: NonNullable<ChatMessage['card']>
  onViewCode: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        {card.status === 'building' ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent-secondary" />
        ) : card.status === 'error' ? (
          <XCircle className="h-4 w-4 shrink-0 text-red-400" />
        ) : (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
        )}
        <span>{card.title}</span>
      </div>

      {card.status === 'done' ? (
        <button
          type="button"
          onClick={onViewCode}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-border-strong hover:text-foreground"
        >
          <Code2 className="h-3.5 w-3.5" />
          View code
        </button>
      ) : null}
    </div>
  )
}
