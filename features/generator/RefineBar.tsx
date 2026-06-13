'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Wand2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { MAX_INPUT_CHARS, MIN_INPUT_CHARS } from '@/lib/input/constants'

const refineSchema = z.object({
  instruction: z.string().trim().min(MIN_INPUT_CHARS).max(MAX_INPUT_CHARS),
})

type RefineFormValues = z.infer<typeof refineSchema>

interface RefineBarProps {
  isLoading: boolean
  onSubmit: (instruction: string) => void
}

export function RefineBar({ isLoading, onSubmit }: RefineBarProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RefineFormValues>({
    resolver: zodResolver(refineSchema),
    defaultValues: { instruction: '' },
  })

  const submit = handleSubmit(({ instruction }) => {
    onSubmit(instruction)
    reset()
  })

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex w-full items-center gap-2 rounded-full border border-border bg-surface-raised p-1 transition-colors focus-within:border-border-strong">
        <input
          {...register('instruction')}
          type="text"
          placeholder='Refine it — e.g. "make it darker" or "add testimonials"'
          disabled={isLoading}
          className="w-full bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none disabled:opacity-60"
        />
        <Button
          type="submit"
          disabled={isLoading}
          variant="gradient"
          className="aspect-square shrink-0 rounded-full p-2.5"
          aria-label="Refine page"
        >
          {isLoading ? <Spinner /> : <Wand2 className="h-4 w-4" />}
        </Button>
      </div>
      {errors.instruction ? (
        <p className="mt-1.5 px-1 text-xs text-red-400">{errors.instruction.message}</p>
      ) : null}
    </form>
  )
}
