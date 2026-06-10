'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { generateRequestSchema, type GenerateRequestBody } from '@/lib/ai/schema'

import { ExamplePrompts } from './ExamplePrompts'

interface PromptFormProps {
  value: string
  isLoading: boolean
  onChange: (prompt: string) => void
  onSubmit: (prompt: string) => void
}

export function PromptForm({ value, isLoading, onChange, onSubmit }: PromptFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GenerateRequestBody>({
    resolver: zodResolver(generateRequestSchema),
    defaultValues: { prompt: value },
  })

  const promptValue = watch('prompt')

  useEffect(() => {
    onChange(promptValue ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptValue])

  const submit = handleSubmit(({ prompt }) => onSubmit(prompt))

  return (
    <form onSubmit={submit} className="w-full max-w-2xl">
      <div className="rounded-3xl border border-border bg-surface p-3 shadow-[0_24px_64px_-32px_rgba(0,0,0,0.8)] transition-colors focus-within:border-border-strong">
        <textarea
          {...register('prompt')}
          rows={3}
          placeholder="Describe the website you want to build..."
          disabled={isLoading}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          className="w-full resize-none bg-transparent px-3 py-2 text-base text-foreground placeholder:text-muted focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center justify-between px-1 pt-1">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Press Enter to generate, Shift+Enter for a new line
          </span>
          <Button
            type="submit"
            variant="gradient"
            disabled={isLoading}
            className="ml-auto rounded-full"
          >
            {isLoading ? (
              <>
                <Spinner /> Generating
              </>
            ) : (
              <>
                Generate <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
      {errors.prompt ? (
        <p className="mt-2 text-center text-sm text-red-400">{errors.prompt.message}</p>
      ) : null}
      <div className="mt-4">
        <ExamplePrompts
          disabled={isLoading}
          onSelect={(example) => setValue('prompt', example, { shouldValidate: true })}
        />
      </div>
    </form>
  )
}
