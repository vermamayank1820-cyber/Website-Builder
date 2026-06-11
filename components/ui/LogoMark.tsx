import { cn } from '@/utils/cn'

interface LogoMarkProps {
  className?: string
  /** Tailwind size classes for the badge, e.g. "h-8 w-8 text-sm". */
  sizeClassName?: string
}

export function LogoMark({ className, sizeClassName = 'h-8 w-8 text-sm' }: LogoMarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-accent-gradient font-bold text-white',
        sizeClassName,
        className
      )}
    >
      P
    </span>
  )
}
