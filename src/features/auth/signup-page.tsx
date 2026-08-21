import * as React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import { useApp } from '@/store/app'
import { cn } from '@/lib/utils'
import { AuthShell, FederatedButtons, OrDivider } from './auth-shell'

/**
 * Creating an account.
 *
 * Three fields, because every one of them is needed to provision anything, and
 * the rest of what onboarding asks for can wait until it is actually required.
 *
 * What it collects is written into the onboarding draft on submit, which is what
 * lets the flow skip its own profile step. Asking for a name, an email and a
 * password on this page and then asking for all three again two screens later is
 * the single most annoying thing a signup can do.
 *
 * Any search params arrive from the landing hero's number search — country, type,
 * capability — and are handed straight through to onboarding so the preferences
 * someone set before signing up are still set afterwards.
 */
export default function SignupPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const patchOnboarding = useApp((s) => s.patchOnboarding)

  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [show, setShow] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  const checks = [
    { label: '10+ characters', ok: password.length >= 10 },
    { label: 'A number', ok: /\d/.test(password) },
    { label: 'Mixed case', ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
  ]

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    patchOnboarding({ name, email, password })
    const q = params.toString()
    setTimeout(() => navigate(q ? `/welcome?${q}` : '/welcome'), 450)
  }

  return (
    <AuthShell
      title={t('Start with a number')}
      subtitle={t('No card today. Local numbers activate the moment you check out.')}
      footer={
        <>
          {t('Already have an account?')}{' '}
          <Link to="/login" className="font-medium text-brand-ink underline-offset-4 hover:underline">
            {t('Sign in')}
          </Link>
        </>
      }
    >
      <FederatedButtons verb="up" />
      <OrDivider />

      <form onSubmit={submit} className="grid gap-4">
        <Field label={t('Full name')} htmlFor="name">
          <Input
            id="name"
            autoComplete="name"
            inputSize="lg"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('Youssef Hegazy')}
          />
        </Field>

        <Field label={t('Work email')} htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputSize="lg"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('you@company.com')}
          />
        </Field>

        <Field label={t('Password')} htmlFor="password">
          <Input
            id="password"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            inputSize="lg"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            trailing={
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? t('Hide') : t('Show')}
                className="grid size-7 place-items-center rounded-md text-ink-faint transition-colors hover:text-ink"
              >
                {show ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            }
          />
        </Field>

        {/* The requirements appear once there is something to check them
            against. Shown up front they read as a list of hurdles. */}
        {password.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {checks.map((c) => (
              <span
                key={c.label}
                className={cn(
                  'inline-flex items-center gap-1 text-2xs',
                  c.ok ? 'text-success-ink' : 'text-ink-faint',
                )}
              >
                {c.ok ? <CheckIcon className="size-2.5" /> : <span aria-hidden className="size-2.5" />}
                {t(c.label)}
              </span>
            ))}
          </div>
        )}

        <Button type="submit" variant="primary" size="xl" block loading={busy} className="mt-1 shadow-brand">
          {t('Create account')}
        </Button>
      </form>
    </AuthShell>
  )
}
