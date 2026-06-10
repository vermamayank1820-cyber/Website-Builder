import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gradient' | 'light'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-foreground hover:brightness-110 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_24px_-12px_var(--accent)]',
  secondary:
    'bg-surface-raised text-foreground border border-border hover:border-border-strong',
  ghost: 'text-muted hover:text-foreground hover:bg-white/5',
  gradient:
    'bg-accent-gradient text-white hover:brightness-110 shadow-[0_8px_24px_-12px_var(--accent)]',
  light: 'bg-white text-black hover:bg-white/90',
}

export function Button({
  variant = 'primary',
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-150 ease-out',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  )
}
