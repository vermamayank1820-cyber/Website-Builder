import type { InputHTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-foreground',
        'placeholder:text-muted-foreground',
        'transition-colors duration-150 ease-out',
        'hover:border-border-strong',
        'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}
