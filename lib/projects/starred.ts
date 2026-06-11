const STORAGE_KEY = 'promptsite:starred-projects'

/** Starred project ids, kept client-side (localStorage) per device. */
export function getStarredIds(): ReadonlySet<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [])
  } catch {
    return new Set()
  }
}

export function toggleStarred(projectId: string): ReadonlySet<string> {
  const next = new Set(getStarredIds())
  if (next.has(projectId)) {
    next.delete(projectId)
  } else {
    next.add(projectId)
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
  } catch {
    // Storage full/unavailable — starring just won't persist.
  }
  return next
}
