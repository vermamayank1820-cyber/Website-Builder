'use client'

import { ArrowLeft, Check, Loader2, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LogoMark } from '@/components/ui/LogoMark'
import type { WorkspaceUser } from '@/features/workspace/UserMenu'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface SettingsScreenProps {
  user: WorkspaceUser
  projectCount: number
}

export function SettingsScreen({ user, projectCount }: SettingsScreenProps) {
  const router = useRouter()
  const [name, setName] = useState(user.name ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setIsSaved(false)
    setError(null)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: name.trim() || null })
        .eq('id', user.id)
      if (updateError) {
        setError(updateError.message)
        return
      }
      setIsSaved(true)
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await getSupabaseBrowserClient().auth.signOut()
      router.replace('/login')
    } catch {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Workspace
          </Link>
          <LogoMark />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-24 pt-10">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your account and workspace.</p>

        <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold tracking-tight">Profile</h2>
          <form onSubmit={(event) => void handleSave(event)} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="display-name" className="text-xs font-medium text-muted">
                Display name
              </label>
              <Input
                id="display-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setIsSaved(false)
                }}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-muted">
                Email
              </label>
              <Input id="email" value={user.email} disabled />
              <p className="text-[0.7rem] text-muted-foreground">
                Your email is managed by your sign-in provider.
              </p>
            </div>

            {error ? <p className="text-xs text-red-400">{error}</p> : null}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
              {isSaved ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                  <Check className="h-3.5 w-3.5" /> Saved
                </span>
              ) : null}
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold tracking-tight">Workspace</h2>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm">Projects</p>
              <p className="text-xs text-muted">
                {projectCount} saved project{projectCount === 1 ? '' : 's'} — every
                generation and edit is versioned automatically.
              </p>
            </div>
            <Link
              href="/workspace"
              className="text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold tracking-tight">Session</h2>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted">
              Sign out of PromptSite on this device. Your projects stay safely stored.
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
