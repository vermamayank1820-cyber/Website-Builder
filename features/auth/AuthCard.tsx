'use client'

import { Loader2, MailCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/utils/cn'

type AuthMode = 'signin' | 'signup'

interface AuthCardProps {
  /** Internal path to land on after auth completes. */
  nextPath: string
  /** Server-provided error (e.g. from a failed OAuth callback). */
  initialError?: string
  /** Called once an email/password session is established. */
  onAuthenticated: () => void
}

const MIN_PASSWORD_LENGTH = 8

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.14-4.06 1.14-3.12 0-5.77-2.1-6.71-4.94H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.29a12 12 0 0 0 0 10.78l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.43-3.43A11.97 11.97 0 0 0 1.29 6.61l4 3.1C6.23 6.87 8.88 4.77 12 4.77Z"
      />
    </svg>
  )
}

/**
 * The authentication card: Google SSO as the dominant action, with
 * email/password sign-in and sign-up behind a single minimal form.
 */
export function AuthCard({ nextPath, initialError, onAuthenticated }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const handleGoogle = async () => {
    setError(null)
    setIsGoogleLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      })
      if (oauthError) {
        setError(oauthError.message)
        setIsGoogleLoading(false)
      }
      // On success the browser navigates away — keep the spinner running.
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Could not start Google sign in')
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (mode === 'signup' && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = getSupabaseBrowserClient()

      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) {
          setError(signInError.message)
          return
        }
        onAuthenticated()
        return
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.session) {
        onAuthenticated()
      } else {
        // Email confirmations are enabled in this Supabase project.
        setConfirmationSent(true)
      }
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (confirmationSent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface">
          <MailCheck className="h-5 w-5 text-accent" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Check your inbox</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          We sent a confirmation link to <span className="text-foreground">{email}</span>.
          Click it to finish creating your account.
        </p>
        <button
          type="button"
          onClick={() => setConfirmationSent(false)}
          className="mt-6 text-sm text-muted transition-colors hover:text-foreground"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-semibold tracking-tight">
        {mode === 'signin' ? 'Welcome back' : 'Create your account'}
      </h2>
      <p className="mt-1.5 text-sm text-muted">
        {mode === 'signin'
          ? 'Sign in to pick up where you left off.'
          : 'Your first website is one prompt away.'}
      </p>

      <Button
        type="button"
        variant="light"
        onClick={() => void handleGoogle()}
        disabled={isGoogleLoading || isSubmitting}
        className="mt-7 w-full py-3 text-[0.9rem] font-semibold"
      >
        {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3" role="separator">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[0.7rem] font-medium tracking-widest text-muted-foreground uppercase">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3.5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-muted">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-medium text-muted">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
            placeholder={mode === 'signup' ? `${MIN_PASSWORD_LENGTH}+ characters` : '••••••••'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-red-400">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="secondary"
          disabled={isSubmitting || isGoogleLoading}
          className={cn('w-full py-3', isSubmitting && 'opacity-80')}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Continue
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
          }}
          className="font-medium text-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
