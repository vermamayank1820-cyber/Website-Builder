import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gradient' | 'light'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

/* Multi-layer surfaces: a soft top sheen over the gradient, an inset
   hairline, and an ambient color glow — Linear/Stripe-style depth. */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: cn(
    'text-white',
    'bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_42%),linear-gradient(135deg,var(--accent),color-mix(in_oklab,var(--accent)_72%,var(--accent-secondary)))]',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.08),0_10px_28px_-10px_var(--accent),0_2px_8px_rgba(0,0,0,0.45)]',
    'enabled:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_0_0_1px_rgba(255,255,255,0.12),0_14px_36px_-10px_var(--accent),0_2px_8px_rgba(0,0,0,0.45)]',
    'enabled:hover:brightness-110'
  ),
  gradient: cn(
    'text-white',
    'bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0)_45%),linear-gradient(135deg,var(--accent)_0%,var(--accent-secondary)_100%)]',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.08),0_12px_32px_-10px_var(--accent),0_4px_16px_-8px_var(--accent-secondary)]',
    'enabled:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_0_0_1px_rgba(255,255,255,0.14),0_16px_40px_-10px_var(--accent),0_6px_20px_-8px_var(--accent-secondary)]',
    'enabled:hover:brightness-110'
  ),
  secondary: cn(
    'text-foreground backdrop-blur-md',
    'bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.09)]',
    'enabled:hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))]',
    'enabled:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(255,255,255,0.16),0_8px_24px_-12px_rgba(0,0,0,0.7)]'
  ),
  ghost: 'text-muted enabled:hover:text-foreground enabled:hover:bg-white/[0.06]',
  light: cn(
    'bg-white text-black',
    'shadow-[inset_0_-1px_0_rgba(0,0,0,0.08),0_8px_24px_-12px_rgba(255,255,255,0.4)]',
    'enabled:hover:bg-white/95'
  ),
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
        'ease-spring inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200',
        'enabled:hover:scale-[1.02] enabled:hover:-translate-y-px enabled:active:scale-[0.98] enabled:active:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  )
}
