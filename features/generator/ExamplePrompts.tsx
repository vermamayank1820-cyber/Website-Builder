import { EXAMPLE_PROMPTS } from './example-prompts'

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export function ExamplePrompts({ onSelect, disabled }: ExamplePromptsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {EXAMPLE_PROMPTS.map((example) => (
        <button
          key={example.label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(example.prompt)}
          className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-border-strong hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {example.label}
        </button>
      ))}
    </div>
  )
}
