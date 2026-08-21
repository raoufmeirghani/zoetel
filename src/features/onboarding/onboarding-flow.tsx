import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Building2,
  Check,
  Cable,
  CircleCheck,
  Code2,
  Eye,
  EyeOff,
  Globe,
  Headphones,
  Headset,
  MessageSquare,
  MoreHorizontal,
  Phone,
  PhoneOutgoing,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  User,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Logo, Wordmark } from '@/components/layout/logo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { StepList } from '@/components/ui/stepper'
import { Alert } from '@/components/ui/feedback'
import { DocUploadCard } from '@/features/verification/doc-upload'
import { COUNTRIES, TIMEZONES, USE_CASES } from '@/lib/data/countries'
import { useApp, docsFor } from '@/store/app'
import { money } from '@/lib/format'
import { cn, sleep } from '@/lib/utils'
import { useThemeEffect } from '@/hooks/use-theme'
import type { Currency, PlanKind } from '@/lib/types'
import { useDirSign, useI18n } from '@/lib/i18n'
import { LocaleSwitch } from '@/components/shared/locale-switch'

/**
 * The welcome step is hidden for now, so the flow opens on the first real
 * question instead of a splash screen. Everything about it is still here — its
 * markup, its copy, its quote on the side rail — because "for now" means one
 * constant to flip back, not a deletion to reconstruct.
 *
 * Every index in this file counts from `STEPS`, so the entry stays in the array
 * and `FIRST_STEP` decides where the flow actually starts.
 */
const FIRST_STEP = 1

const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'type', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'usecase', label: 'Use case' },
  { id: 'verify', label: 'Verification' },
  { id: 'funding', label: 'Funding' },
  { id: 'done', label: 'Done' },
] as const

const schema = z.object({
  accountType: z.enum(['individual', 'business']).nullable(),
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(10, 'Use at least 10 characters'),
  country: z.string().min(2),
  workspaceName: z.string().min(2, 'Give your workspace a name'),
  businessName: z.string(),
  timezone: z.string(),
  currency: z.enum(['USD', 'EGP', 'EUR', 'AED', 'GBP']),
  workspaceCountry: z.string(),
  useCase: z.string(),
})

type FormValues = z.infer<typeof schema>

const EASE = [0.16, 1, 0.3, 1] as const

export default function OnboardingFlow() {
  const { t } = useI18n()
  const dirSign = useDirSign()
  useThemeEffect()
  const navigate = useNavigate()
  const onboarding = useApp((s) => s.onboarding)
  const patchOnboarding = useApp((s) => s.patchOnboarding)
  const completeOnboarding = useApp((s) => s.completeOnboarding)
  const setAccountType = useApp((s) => s.setAccountType)
  const verification = useApp((s) => s.verification)
  const uploadDoc = useApp((s) => s.uploadDoc)
  const removeDoc = useApp((s) => s.removeDoc)
  const submitVerification = useApp((s) => s.submitVerification)
  const markOnboarded = useApp((s) => s.markOnboarded)

  /** Any route out of onboarding counts as "seen", so we never trap the user here. */
  const leave = React.useCallback(
    (to: string) => {
      markOnboarded()
      navigate(to)
    },
    [markOnboarded, navigate],
  )

  const [step, setStep] = React.useState(
    onboarding.completed ? FIRST_STEP : Math.max(onboarding.step, FIRST_STEP),
  )
  const [direction, setDirection] = React.useState(1)
  const [showPassword, setShowPassword] = React.useState(false)
  const [plan, setPlan] = React.useState<PlanKind | null>(onboarding.plan)
  const [creating, setCreating] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      accountType: onboarding.accountType,
      name: onboarding.name,
      email: onboarding.email,
      password: onboarding.password,
      country: onboarding.country || 'EG',
      workspaceName: onboarding.workspaceName,
      businessName: onboarding.businessName,
      timezone: onboarding.timezone || 'Africa/Cairo',
      currency: onboarding.currency || 'USD',
      workspaceCountry: onboarding.workspaceCountry || 'EG',
      useCase: onboarding.useCase,
    },
  })
  const values = form.watch()

  const go = async (next: number) => {
    if (next > step) {
      const fields: Record<number, (keyof FormValues)[]> = {
        2: ['name', 'email', 'password', 'country'],
        3: ['workspaceName'],
      }
      const toCheck = fields[step]
      if (toCheck) {
        const ok = await form.trigger(toCheck)
        if (!ok) return
      }
    }
    setDirection(next > step ? 1 : -1)
    setStep(next)
    patchOnboarding({ ...values, step: next, plan })
  }

  const finish = async () => {
    setCreating(true)
    patchOnboarding({ ...values, plan, step: 7 })
    await sleep(1500)
    completeOnboarding()
    setCreating(false)
    setDirection(1)
    setStep(7)
  }

  const current = STEPS[step]
  /** Zod carries the English message; the dictionary turns it into copy. */
  const err = (m?: string) => (m ? t(m) : undefined)
  const progress = (step / (STEPS.length - 1)) * 100
  const docs = verification.docs
  const uploadedDocs = docs.filter((d) => d.status !== 'missing').length

  return (
    <div className="min-h-dvh overflow-x-clip bg-canvas lg:grid lg:grid-cols-[26rem_1fr]">
      {/* ── Brand rail ────────────────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-onyx p-10 text-onyx-fg lg:flex lg:flex-col">
        <div
          className="top-1/5 pointer-events-none absolute -start-32 size-[34rem] rounded-full opacity-[0.34] blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--brand)) 0%, transparent 66%)' }}
        />
        <div
          className="pointer-events-none absolute -end-24 bottom-0 size-[26rem] rounded-full opacity-[0.2] blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(28 92% 62%) 0%, transparent 66%)' }}
        />
        <div className="relative flex items-center gap-2.5">
          <Logo size={30} tone="onDark" />
          <span className="display text-lg font-semibold tracking-[-0.02em] text-white">Zoetel</span>
        </div>

        <div className="relative mt-14 flex-1">
          <StepList
            steps={STEPS.slice(1, 7).map((s, i) => ({
              label: t(s.label),
              state: step - 1 > i ? 'done' : step - 1 === i ? 'active' : 'pending',
            }))}
            className="[&_p.text-ink-subtle]:text-white/40 [&_p]:text-white/85"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="relative"
          >
            <div className="rounded-3xl bg-white/[0.07] p-5 backdrop-blur-sm">
              <p className="text-sm leading-relaxed text-white/75">{t(RAIL_COPY[current.id].quote)}</p>
              <p className="mt-3 text-xs text-white/40">{t(RAIL_COPY[current.id].by)}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="relative mt-6 flex items-center gap-4 text-xs text-white/35">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" />
            {t('NTRA licensed')}
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="size-3.5" />
            {t('{n} countries live', { n: 6 })}
          </span>
        </div>
      </aside>

      {/* ── Form column ───────────────────────────────── */}
      <main className="relative isolate flex min-h-dvh flex-col">
        <div className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-96 overflow-hidden">
          <span
            className="hero-mesh"
            style={{ '--hero-2': '28 92% 62%', '--hero-3': '190 88% 58%' } as React.CSSProperties}
          />
        </div>
        <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-8">
          <div className="lg:hidden">
            <Wordmark />
          </div>
          <div className="ms-auto flex items-center gap-2 sm:gap-3">
            {/* Language sits in the header for the whole of onboarding. It is
                the one place in the product where the account menu isn't
                available yet, and the one place where someone may not be able
                to read the page they are being asked to fill in. */}
            <LocaleSwitch size="sm" />
            {step > 0 && step < 7 && (
              <span className="hidden text-sm tabular-nums text-ink-faint sm:inline">
                {t('Step {n} of {total}', { n: step, total: STEPS.length - 2 })}
              </span>
            )}
            {step < 7 && (
              <Button variant="ghost" size="sm" onClick={() => leave('/')} className="text-ink-subtle">
                {t('Skip for now')}
              </Button>
            )}
          </div>
        </div>

        {step > 0 && step < 7 && (
          <div className="px-5 pt-4 sm:px-8">
            <Progress value={progress} size="xs" />
          </div>
        )}

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-lg">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 24 * dirSign }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 * dirSign }}
                transition={{ duration: 0.32, ease: EASE }}
              >
                {/* ── 0 Welcome ─────────────────────── */}
                {current.id === 'welcome' && (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                      className="mx-auto"
                    >
                      <Logo size={56} className="mx-auto" />
                    </motion.div>
                    <h1 className="display mt-7 text-4xl font-semibold text-ink">
                      {t('Voice infrastructure, without the telco.')}
                    </h1>
                    <p className="mx-auto mt-4 max-w-md text-md leading-relaxed text-ink-muted">
                      {t(
                        'Buy a phone number, point it at your code, and start taking calls in minutes — with the compliance paperwork handled for you.',
                      )}
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-3">
                      <Button
                        variant="primary"
                        size="xl"
                        onClick={() => go(1)}
                        className="w-full sm:w-auto sm:px-8"
                      >
                        {t('Get started')}
                        <ArrowRight className="size-[18px]" />
                      </Button>
                      <button
                        onClick={() => leave('/')}
                        className="text-sm text-ink-subtle transition-colors hover:text-ink"
                      >
                        {t('I already have an account')}
                      </button>
                    </div>
                    <div className="mt-12 grid gap-3 text-start sm:grid-cols-3">
                      {[
                        { icon: Zap, t: 'Live in minutes', d: 'Numbers activate instantly' },
                        { icon: ShieldCheck, t: 'Compliance built in', d: 'KYC guided step by step' },
                        { icon: Headphones, t: 'Real engineers', d: 'Support that knows SIP' },
                      ].map((f, i) => (
                        <motion.div
                          key={f.t}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 + i * 0.08, duration: 0.4, ease: EASE }}
                          className="rounded-3xl bg-surface/70 p-4 shadow-ring backdrop-blur"
                        >
                          <f.icon className="size-4 text-brand" />
                          <p className="mt-2.5 text-sm font-semibold text-ink">{t(f.t)}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-ink-subtle">{t(f.d)}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 1 Account type ────────────────── */}
                {current.id === 'type' && (
                  <StepShell
                    title={t('Who is this account for?')}
                    description={t(
                      "Telecom regulators treat individuals and companies differently, so this decides which documents we'll need later — and which number ranges you can buy.",
                    )}
                  >
                    <div className="space-y-3">
                      {[
                        {
                          value: 'individual' as const,
                          icon: User,
                          label: t('Individual'),
                          blurb: t('Numbers in your own name.'),
                          perks: ['Local and mobile numbers', 'ID verification only', 'Ready in under an hour'],
                        },
                        {
                          value: 'business' as const,
                          icon: Building2,
                          label: t('Business'),
                          blurb: t('A registered company or organisation.'),
                          perks: [
                            'Every range including toll-free',
                            'Higher channel limits',
                            'Volume pricing available',
                          ],
                        },
                      ].map((opt) => {
                        const active = values.accountType === opt.value
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              form.setValue('accountType', opt.value)
                              setAccountType(opt.value)
                            }}
                            className={cn(
                              'flex w-full items-start gap-4 rounded-2xl p-4 text-start ring-1 transition-all duration-200 sm:p-4.5',
                              active
                                ? 'bg-brand-softer ring-brand/40'
                                : 'veil ring-line-soft hover:bg-veil-strong hover:ring-line-strong',
                            )}
                          >
                            <span
                              className={cn(
                                'grid size-10 shrink-0 place-items-center rounded-xl transition-colors',
                                active ? 'bg-brand text-brand-fg' : 'bg-veil-strong text-ink-muted',
                              )}
                            >
                              <opt.icon className="size-[18px]" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="text-md font-semibold text-ink">{opt.label}</span>
                                {active && <Check className="size-4 text-brand" />}
                              </span>
                              <span className="mt-0.5 block text-sm text-ink-subtle">{opt.blurb}</span>
                              <span className="mt-2.5 flex flex-wrap gap-1.5">
                                {opt.perks.map((p) => (
                                  <Badge key={p} tone={active ? 'brand' : 'neutral'} size="sm">
                                    {t(p)}
                                  </Badge>
                                ))}
                              </span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <Nav
                      // Nothing behind this step now, so Back leaves rather
                      // than returning to a screen the flow skipped.
                      onBack={() => leave('/landing')}
                      onNext={() => go(2)}
                      nextDisabled={!values.accountType}
                      hint={t('You can change this later, though it restarts verification.')}
                    />
                  </StepShell>
                )}

                {/* ── 2 Profile ─────────────────────── */}
                {current.id === 'profile' && (
                  <StepShell title={t('Create your account')} description={t("This is how you'll sign in.")}>
                    <div className="space-y-4">
                      <Field label={t('Full name')} required error={err(form.formState.errors.name?.message)}>
                        <Input
                          {...form.register('name')}
                          placeholder={t('Youssef Hegazy')}
                          autoFocus
                          inputSize="lg"
                          aria-invalid={!!form.formState.errors.name}
                        />
                      </Field>
                      <Field
                        label={t('Work email')}
                        required
                        error={err(form.formState.errors.email?.message)}
                        description={t("We'll send verification updates and billing receipts here.")}
                      >
                        <Input
                          {...form.register('email')}
                          type="email"
                          placeholder={'you@company.com'}
                          inputSize="lg"
                          aria-invalid={!!form.formState.errors.email}
                        />
                      </Field>
                      <Field
                        label={t('Password')}
                        required
                        error={err(form.formState.errors.password?.message)}
                        hint={
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="inline-flex items-center gap-1 text-brand-ink hover:underline"
                          >
                            {showPassword ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                            {showPassword ? t('Hide') : t('Show')}
                          </button>
                        }
                      >
                        <Input
                          {...form.register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('At least 10 characters')}
                          inputSize="lg"
                          aria-invalid={!!form.formState.errors.password}
                        />
                        <PasswordStrength value={values.password} />
                      </Field>
                      <Field label={t('Country of residence')} required>
                        <Select value={values.country} onValueChange={(v) => form.setValue('country', v)}>
                          <SelectTrigger size="lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c.code} value={c.code} hint={c.dial}>
                                <span className="flex items-center gap-2">
                                  <span>{c.flag}</span>
                                  {t(c.name)}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <Nav
                      onBack={() => go(1)}
                      onNext={() => go(3)}
                      hint={t('We never sell or share your details.')}
                    />
                  </StepShell>
                )}

                {/* ── 3 Workspace ───────────────────── */}
                {current.id === 'workspace' && (
                  <StepShell
                    title={t('Set up your workspace')}
                    description={t(
                      'A workspace holds your numbers, connections, wallet and team. Most companies need just one.',
                    )}
                  >
                    <div className="space-y-4">
                      <Field
                        label={t('Workspace name')}
                        required
                        error={err(form.formState.errors.workspaceName?.message)}
                        description={t('Something your team will recognise.')}
                      >
                        <Input
                          {...form.register('workspaceName')}
                          placeholder={t('Acme Retail')}
                          autoFocus
                          inputSize="lg"
                          aria-invalid={!!form.formState.errors.workspaceName}
                        />
                      </Field>
                      {values.accountType === 'business' && (
                        <Field
                          label={t('Legal business name')}
                          description={t(
                            'Must match your commercial registration exactly — it goes on your invoices.',
                          )}
                        >
                          <Input
                            {...form.register('businessName')}
                            placeholder={t('Acme Retail LLC')}
                            inputSize="lg"
                          />
                        </Field>
                      )}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t('Country')}>
                          <Select
                            value={values.workspaceCountry}
                            onValueChange={(v) => form.setValue('workspaceCountry', v)}
                          >
                            <SelectTrigger size="lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.filter((c) => c.live).map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                  <span className="flex items-center gap-2">
                                    <span>{c.flag}</span>
                                    {t(c.name)}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label={t('Currency')}>
                          <Select
                            value={values.currency}
                            onValueChange={(v) => form.setValue('currency', v as Currency)}
                          >
                            <SelectTrigger size="lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">{t('US Dollar (USD)')}</SelectItem>
                              <SelectItem value="EGP">{t('Egyptian Pound (EGP)')}</SelectItem>
                              <SelectItem value="EUR">{t('Euro (EUR)')}</SelectItem>
                              <SelectItem value="AED">{t('UAE Dirham (AED)')}</SelectItem>
                              <SelectItem value="GBP">{t('British Pound (GBP)')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                      <Field label={t('Timezone')} description={t('Reports and scheduled exports use this.')}>
                        <Select value={values.timezone} onValueChange={(v) => form.setValue('timezone', v)}>
                          <SelectTrigger size="lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMEZONES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t.replace(/_/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <Nav onBack={() => go(2)} onNext={() => go(4)} />
                  </StepShell>
                )}

                {/* ── 4 Use case ────────────────────── */}
                {current.id === 'usecase' && (
                  <StepShell
                    title={t('What are you building?')}
                    description={t(
                      'This only shapes the tips and examples we show you — nothing is locked either way.',
                    )}
                  >
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5">
                      {USE_CASES.map((u, i) => {
                        const active = values.useCase === u.id
                        const Icon = USE_CASE_ICONS[u.id] ?? Sparkles
                        return (
                          <motion.button
                            key={u.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.035, duration: 0.3, ease: EASE }}
                            onClick={() => form.setValue('useCase', u.id)}
                            className={cn(
                              'flex flex-col items-start gap-3.5 rounded-2xl p-4 text-start ring-1 transition-all duration-150 sm:p-4.5',
                              active
                                ? 'bg-brand-softer ring-brand/40'
                                : 'veil ring-line-soft hover:bg-veil-strong hover:ring-line-strong',
                            )}
                          >
                            <span
                              className={cn(
                                'grid size-9 shrink-0 place-items-center rounded-xl transition-colors',
                                active ? 'bg-brand text-brand-fg' : 'bg-veil-strong text-ink-muted',
                              )}
                            >
                              <Icon className="size-[18px]" />
                            </span>
                            <span className="block">
                              <span
                                className={cn(
                                  'block text-sm font-semibold',
                                  active ? 'text-brand-ink' : 'text-ink',
                                )}
                              >
                                {t(u.label)}
                              </span>
                              <span className="mt-1 block text-xs leading-relaxed text-ink-subtle">
                                {t(u.blurb)}
                              </span>
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                    <Nav onBack={() => go(3)} onNext={() => go(5)} nextDisabled={!values.useCase} />
                  </StepShell>
                )}

                {/* ── 5 Verification ────────────────── */}
                {current.id === 'verify' && (
                  <StepShell
                    title={t('Verify your identity')}
                    description={
                      values.accountType === 'business'
                        ? t(
                            'Egypt requires a verified business entity before national, mobile and toll-free numbers can be provisioned. Most reviews finish within a few hours.',
                          )
                        : t(
                            'Egypt requires identity verification before certain number ranges can be provisioned. Most reviews finish within a few hours.',
                          )
                    }
                  >
                    <Alert tone="brand" compact className="mb-4" icon={<ShieldCheck />}>
                      {t(
                        "You can skip this and start with a local number today — we'll remind you when you reach a range that needs it.",
                      )}
                    </Alert>
                    <div className="space-y-2.5">
                      {docs.slice(0, 3).map((doc, i) => (
                        <DocUploadCard
                          key={doc.kind}
                          doc={doc}
                          index={i}
                          onUpload={(file) => uploadDoc(doc.kind, file)}
                          onRemove={() => removeDoc(doc.kind)}
                        />
                      ))}
                    </div>
                    {docs.length > 3 && (
                      <p className="mt-3 text-center text-xs text-ink-faint">
                        {t(
                          docs.length - 3 === 1
                            ? '{n} more document can be added from the verification page after setup.'
                            : '{n} more documents can be added from the verification page after setup.',
                          { n: docs.length - 3 },
                        )}
                      </p>
                    )}
                    <Nav
                      onBack={() => go(4)}
                      onNext={() => {
                        if (uploadedDocs > 0) submitVerification()
                        go(6)
                      }}
                      nextLabel={uploadedDocs > 0 ? t('Submit and continue') : t('Continue')}
                      secondary={
                        uploadedDocs === 0 ? (
                          <Button variant="ghost" onClick={() => go(6)} className="text-ink-subtle">
                            {t('Do this later')}
                          </Button>
                        ) : undefined
                      }
                      hint={
                        uploadedDocs > 0
                          ? `${uploadedDocs} of ${docsFor(values.accountType ?? 'business').length} documents ready`
                          : undefined
                      }
                    />
                  </StepShell>
                )}

                {/* ── 6 Funding ─────────────────────── */}
                {current.id === 'funding' && (
                  <StepShell
                    // The landing page's line, so the promise someone read
                    // before signing up is the one they meet inside the flow.
                    title={t('Two ways to pay. Neither needs a meeting.')}
                    description={t(
                      'Start with pay as you go — you can move to a committed plan any time, and discounts apply automatically as volume grows.',
                    )}
                  >
                    <div className="space-y-3">
                      {[
                        {
                          value: 'payg' as const,
                          icon: Rocket,
                          label: t('Pay as you go'),
                          price: t('No commitment'),
                          blurb: t('Perfect for startups and first integrations.'),
                          perks: [
                            t('Top up your wallet, pay only for usage'),
                            t('Numbers from {price}/month', {
                              price: money(1.1, values.currency as Currency),
                            }),
                            t('Every API and SIP feature included'),
                            t('Cancel or pause whenever'),
                          ],
                        },
                        {
                          value: 'volume' as const,
                          icon: TrendingDown,
                          label: t('Volume pricing'),
                          price: t('Up to 24% lower'),
                          blurb: t('For predictable monthly traffic.'),
                          perks: [
                            t('Committed monthly minutes at lower rates'),
                            t('Dedicated carrier routes and priority capacity'),
                            t('Named technical account manager'),
                            t('Custom SLA and net-30 invoicing'),
                          ],
                        },
                      ].map((p) => {
                        const active = plan === p.value
                        return (
                          <button
                            key={p.value}
                            onClick={() => setPlan(p.value)}
                            className={cn(
                              'flex w-full items-start gap-4 rounded-2xl p-4 text-start ring-1 transition-all duration-200 sm:p-4.5',
                              active
                                ? 'bg-brand-softer ring-brand/40'
                                : 'veil ring-line-soft hover:bg-veil-strong hover:ring-line-strong',
                            )}
                          >
                            <span
                              className={cn(
                                'grid size-10 shrink-0 place-items-center rounded-xl transition-colors',
                                active ? 'bg-brand text-brand-fg' : 'bg-veil-strong text-ink-muted',
                              )}
                            >
                              <p.icon className="size-[18px]" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-md font-semibold text-ink">{p.label}</span>
                                <Badge tone={active ? 'brand' : 'outline'} size="sm">
                                  {p.price}
                                </Badge>
                                {active && <Check className="size-4 text-brand" />}
                              </span>
                              <span className="mt-0.5 block text-sm text-ink-subtle">{p.blurb}</span>
                              <span className="mt-3 block space-y-1.5">
                                {p.perks.map((k) => (
                                  <span
                                    key={k}
                                    className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted"
                                  >
                                    <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-success" />
                                    {k}
                                  </span>
                                ))}
                              </span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <Nav
                      onBack={() => go(5)}
                      onNext={finish}
                      nextLabel={t('Create my workspace')}
                      nextDisabled={!plan}
                      loading={creating}
                      hint={t('No card is charged today. Volume plans start with a call from our team.')}
                    />
                  </StepShell>
                )}

                {/* ── 7 Success ─────────────────────── */}
                {current.id === 'done' && (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 17 }}
                      className="relative mx-auto grid size-20 place-items-center"
                    >
                      <span className="absolute inset-0 animate-pulse-ring rounded-full bg-success/25" />
                      <span className="relative grid size-16 place-items-center rounded-3xl bg-success-soft text-success">
                        <CircleCheck className="size-8" />
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.42, ease: EASE }}
                    >
                      <h1 className="headline mt-8 text-balance text-3xl text-ink">
                        {t('{name} is ready', { name: values.workspaceName || t('Your workspace') })}
                      </h1>
                      <p className="mx-auto mt-3 max-w-md text-md leading-relaxed text-ink-muted">
                        {t(
                          'One thing left: give your workspace a phone number. Local Cairo lines activate the moment you check out.',
                        )}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.42, ease: EASE }}
                      className="mt-8 space-y-3"
                    >
                      <Button
                        variant="primary"
                        size="xl"
                        block
                        onClick={() => leave('/numbers/buy')}
                        icon={<Phone />}
                      >
                        {t('Buy your first phone number')}
                        <ArrowRight className="size-[18px]" />
                      </Button>
                      <Button variant="ghost" size="lg" block onClick={() => leave('/')}>
                        {t('Take me to the dashboard')}
                      </Button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-10 grid gap-2.5 text-start sm:grid-cols-3"
                    >
                      {[
                        { icon: Phone, t: 'Numbers', d: 'Search live inventory' },
                        { icon: Sparkles, t: 'SIP trunk', d: 'Connect your PBX' },
                        {
                          icon: ShieldCheck,
                          t: 'Verification',
                          d: verification.stage === 'in_review' ? 'In review' : 'Finish later',
                        },
                      ].map((f) => (
                        <div key={f.t} className="rounded-3xl bg-surface/70 p-3.5 shadow-ring backdrop-blur">
                          <f.icon className="size-4 text-brand" />
                          <p className="mt-2 text-sm font-semibold text-ink">{t(f.t)}</p>
                          <p className="mt-0.5 text-xs text-ink-subtle">{t(f.d)}</p>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="px-5 pb-6 text-center sm:px-8">
          <p className="text-xs text-ink-faint">
            {t('By continuing you agree to the acceptable use policy and local telecom regulations.')}
          </p>
        </div>
      </main>
    </div>
  )
}

/**
 * One icon per use case.
 *
 * Lives here rather than in `countries.ts` so the data file stays data. Keyed by
 * id, so a use case without an icon falls back rather than crashing.
 */
const USE_CASE_ICONS: Record<string, LucideIcon> = {
  'ai-voice': Bot,
  'contact-center': Headset,
  'sip-trunk': Cable,
  'call-center': PhoneOutgoing,
  sms: MessageSquare,
  crm: Users,
  pbx: Phone,
  api: Code2,
  other: MoreHorizontal,
}

const RAIL_COPY: Record<string, { quote: string; by: string }> = {
  welcome: {
    quote:
      '“We replaced a three-week carrier onboarding with an afternoon. The numbers were live before our standup finished.”',
    by: 'Head of Engineering, retail platform · Cairo',
  },
  type: {
    quote:
      '“Knowing exactly which documents we needed up front meant compliance took one pass instead of four rounds of email.”',
    by: 'Operations lead, contact centre · Alexandria',
  },
  profile: {
    quote: '“The dashboard is the first telecom tool our developers actually wanted to open.”',
    by: 'CTO, logistics startup · New Cairo',
  },
  workspace: {
    quote: '“One workspace per environment. Sandbox traffic never touches our production wallet.”',
    by: 'Platform engineer, fintech · Giza',
  },
  usecase: {
    quote: '“Our AI agent answers in under 400 ms end to end. Media streaming was two lines of code.”',
    by: 'Founder, voice AI company · Cairo',
  },
  verify: {
    quote: '“Verification took four hours, not four weeks. That is the whole reason we switched.”',
    by: 'Managing director, BPO · Alexandria',
  },
  funding: {
    quote: '“We started pay as you go on a Tuesday and moved to a committed plan the following quarter.”',
    by: 'Finance lead, delivery platform · Cairo',
  },
  done: {
    quote: '“From signup to first answered call: eleven minutes.”',
    by: 'Solutions architect, insurance · Cairo',
  },
}

function StepShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h1 className="headline text-balance text-2xl text-ink sm:text-3xl">{title}</h1>
      {description && <p className="mt-4 text-md leading-relaxed text-ink-muted">{description}</p>}
      <div className="mt-7">{children}</div>
    </div>
  )
}

function Nav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  loading,
  hint,
  secondary,
}: {
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  loading?: boolean
  hint?: string
  secondary?: React.ReactNode
}) {
  const { t } = useI18n()

  return (
    <>
      {/* On a phone the step's actions stick to the bottom of the screen. A
          form long enough to scroll must not put its primary button somewhere
          the thumb has to hunt for, and a signup is exactly that form. Above
          `sm` it goes back to sitting in the flow where it belongs. */}
      <div
        className={cn(
          'z-30 mt-8 max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:mt-0',
          'max-sm:chrome max-sm:border-t max-sm:border-line-soft',
          'max-sm:px-5 max-sm:pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] max-sm:pt-3.5',
        )}
      >
        <div className="mx-auto flex w-full max-w-lg items-center gap-2">
          <Button variant="ghost" size="lg" onClick={onBack} icon={<ArrowLeft />} className="text-ink-subtle">
            {t('Back')}
          </Button>
          <div className="ms-auto flex items-center gap-2">
            {secondary}
            <Button
              variant="primary"
              size="lg"
              onClick={onNext}
              disabled={nextDisabled}
              loading={loading}
              className="max-sm:h-12 max-sm:px-5"
            >
              {nextLabel ?? t('Continue')}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
        {hint && (
          <p className="mx-auto mt-3 w-full max-w-lg text-xs leading-relaxed text-ink-faint max-sm:hidden">
            {hint}
          </p>
        )}
      </div>
      {/* Reserves the bar's height so the last field is never trapped behind it. */}
      <div aria-hidden className="h-24 sm:hidden" />
    </>
  )
}

function PasswordStrength({ value }: { value: string }) {
  const { t } = useI18n()
  const checks = [
    { label: '10+ characters', ok: value.length >= 10 },
    { label: 'A number', ok: /\d/.test(value) },
    { label: 'Mixed case', ok: /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { label: 'A symbol', ok: /[^A-Za-z0-9]/.test(value) },
  ]
  const score = checks.filter((c) => c.ok).length
  if (!value) return null
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full',
              i < score ? (score <= 2 ? 'bg-warning' : score === 3 ? 'bg-info' : 'bg-success') : 'bg-surface-3',
            )}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{ originX: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <span
            key={c.label}
            className={cn('flex items-center gap-1 text-2xs', c.ok ? 'text-success-ink' : 'text-ink-faint')}
          >
            {c.ok ? <Check className="size-2.5" /> : <span className="size-2.5" />}
            {t(c.label)}
          </span>
        ))}
      </div>
    </div>
  )
}
