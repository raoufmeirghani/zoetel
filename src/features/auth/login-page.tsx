import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import { useApp } from '@/store/app'
import { AuthShell, FederatedButtons, OrDivider } from './auth-shell'

/**
 * Signing in.
 *
 * Email is prefilled from the stored profile when there is one. Someone
 * returning to this page has almost always been here before, and asking them to
 * retype an address we already have is the kind of small rudeness that adds up.
 */
export default function LoginPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const profile = useApp((s) => s.profile)
  const hasOnboarded = useApp((s) => s.hasOnboarded)

  const [email, setEmail] = React.useState(profile.email ?? '')
  const [password, setPassword] = React.useState('')
  const [show, setShow] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    // An account that never finished onboarding lands back in it rather than on
    // a dashboard with nothing in it.
    setTimeout(() => navigate(hasOnboarded ? '/' : '/welcome'), 450)
  }

  return (
    <AuthShell
      title={t('Sign in to Zoetel')}
      subtitle={t('Your numbers, connections and wallet are where you left them.')}
      footer={
        <>
          {t('New here?')}{' '}
          <Link to="/signup" className="font-medium text-brand-ink underline-offset-4 hover:underline">
            {t('Create an account')}
          </Link>
        </>
      }
    >
      <FederatedButtons verb="in" />
      <OrDivider />

      <form onSubmit={submit} className="grid gap-4">
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

        <Field
          label={t('Password')}
          htmlFor="password"
          hint={
            <Link to="/login" className="text-xs text-brand-ink underline-offset-4 hover:underline">
              {t('Forgot?')}
            </Link>
          }
        >
          <Input
            id="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            inputSize="lg"
            required
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

        <Button type="submit" variant="primary" size="xl" block loading={busy} className="mt-1 shadow-brand">
          {t('Sign in')}
        </Button>
      </form>
    </AuthShell>
  )
}
