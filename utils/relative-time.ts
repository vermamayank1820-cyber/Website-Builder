const UNITS: Array<{ limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { limit: 60_000, divisor: 1000, unit: 'second' },
  { limit: 3_600_000, divisor: 60_000, unit: 'minute' },
  { limit: 86_400_000, divisor: 3_600_000, unit: 'hour' },
  { limit: 604_800_000, divisor: 86_400_000, unit: 'day' },
  { limit: 2_629_800_000, divisor: 604_800_000, unit: 'week' },
  { limit: 31_557_600_000, divisor: 2_629_800_000, unit: 'month' },
  { limit: Infinity, divisor: 31_557_600_000, unit: 'year' },
]

const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** "just now", "5 minutes ago", "yesterday", "3 weeks ago", … */
export function relativeTime(isoDate: string): string {
  const elapsed = Date.now() - new Date(isoDate).getTime()
  if (elapsed < 10_000) return 'just now'

  for (const { limit, divisor, unit } of UNITS) {
    if (elapsed < limit) {
      return formatter.format(-Math.round(elapsed / divisor), unit)
    }
  }

  return formatter.format(-Math.round(elapsed / 31_557_600_000), 'year')
}
