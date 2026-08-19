import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CircleCheck,
  Eye,
  EyeOff,
  Globe,
  Headphones,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  User,
  Zap,
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

  const [step, setStep] = React.useState(onboarding.completed ? 0 : onboarding.step)
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
  const progress = (step / (STEPS.length - 1)) * 100
  const docs = verification.docs
  const uploadedDocs = docs.filter((d) => d.status !== 'missing').length

  return (
    <div className="min-h-dvh overflow-x-clip bg-canvas lg:grid lg:grid-cols-[26rem_1fr]">
      {/* ── Brand rail ────────────────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-onyx p-10 text-onyx-fg lg:flex lg:flex-col">
        <div
          className="top-1/5 pointer-events-none absolute -left-32 size-[34rem] rounded-full opacity-[0.34] blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(var(--brand)) 0%, transparent 66%)' }}
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-0 size-[26rem] rounded-full opacity-[0.2] blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(28 92% 62%) 0%, transparent 66%)' }}
        />
        <div className="relative flex items-center gap-2.5">
          <Logo size={30} tone="onDark" />
          <span className="display text-lg font-semibold tracking-[-0.02em] text-white">Zoetel</span>
        </div>

        <div className="relative mt-14 flex-1">
          <StepList
            steps={STEPS.slice(1, 7).map((s, i) => ({
              label: s.label,
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
              <p className="text-sm leading-relaxed text-white/75">{RAIL_COPY[current.id].quote}</p>
              <p className="mt-3 text-xs text-white/40">{RAIL_COPY[current.id].by}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="relative mt-6 flex items-center gap-4 text-xs text-white/35">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" />
            NTRA licensed
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="size-3.5" />6 countries live
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
          <div className="ml-auto flex items-center gap-3">
            {step > 0 && step < 7 && (
              <span className="text-sm tabular-nums text-ink-faint">
                Step {step} of {STEPS.length - 2}
              </span>
            )}
            {step < 7 && (
              <Button variant="ghost" size="sm" onClick={() => leave('/')} className="text-ink-subtle">
                Skip for now
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
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
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
                      Voice infrastructure, without the telco.
                    </h1>
                    <p className="mx-auto mt-4 max-w-md text-md leading-relaxed text-ink-muted">
                      Buy a phone number, point it at your code, and start taking calls in minutes — with the
                      compliance paperwork handled for you.
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-3">
                      <Button
                        variant="primary"
                        size="xl"
                        onClick={() => go(1)}
                        className="w-full sm:w-auto sm:px-8"
                      >
                        Get started
                        <ArrowRight className="size-[18px]" />
                      </Button>
                      <button
                        onClick={() => leave('/')}
                        className="text-sm text-ink-subtle transition-colors hover:text-ink"
                      >
                        I already have an account
                      </button>
                    </div>
                    <div className="mt-12 grid gap-3 text-left sm:grid-cols-3">
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
                          <p className="mt-2.5 text-sm font-semibold text-ink">{f.t}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-ink-subtle">{f.d}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 1 Account type ────────────────── */}
                {current.id === 'type' && (
                  <StepShell
                    title="Who is this account for?"
                    description="Telecom regulators treat individuals and companies differently, so this decides which documents we'll need later — and which number ranges you can buy."
                  >
                    <div className="space-y-3">
                      {[
                        {
                          value: 'individual' as const,
                          icon: User,
                          label: 'Individual',
                          blurb: 'Numbers in your own name.',
                          perks: ['Local and mobile numbers', 'ID verification only', 'Ready in under an hour'],
                        },
                        {
                          value: 'business' as const,
                          icon: Building2,
                          label: 'Business',
                          blurb: 'A registered company or organisation.',
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
                              'flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-all duration-200',
                              active ? 'bg-brand-softer ring-1 ring-brand/40' : 'veil hover:bg-veil-strong',
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
                                    {p}
                                  </Badge>
                                ))}
                              </span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <Nav
                      onBack={() => go(0)}
                      onNext={() => go(2)}
                      nextDisabled={!values.accountType}
                      hint="You can change this later, though it restarts verification."
                    />
                  </StepShell>
                )}

                {/* ── 2 Profile ─────────────────────── */}
                {current.id === 'profile' && (
                  <StepShell title="Create your account" description="This is how you'll sign in.">
                    <div className="space-y-4">
                      <Field label="Full name" required error={form.formState.errors.name?.message}>
                        <Input
                          {...form.register('name')}
                          placeholder="Youssef Hegazy"
                          autoFocus
                          inputSize="lg"
                          aria-invalid={!!form.formState.errors.name}
                        />
                      </Field>
                      <Field
                        label="Work email"
                        required
                        error={form.formState.errors.email?.message}
                        description="We'll send verification updates and billing receipts here."
                      >
                        <Input
                          {...form.register('email')}
                          type="email"
                          placeholder="you@company.com"
                          inputSize="lg"
                          aria-invalid={!!form.formState.errors.email}
                        />
                      </Field>
                      <Field
                        label="Password"
                        required
                        error={form.formState.errors.password?.message}
                        hint={
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="inline-flex items-center gap-1 text-brand-ink hover:underline"
                          >
                            {showPassword ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        }
                      >
                        <Input
                          {...form.register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 10 characters"
                          inputSize="lg"
                          aria-invalid={!!form.formState.errors.password}
                        />
                        <PasswordStrength value={values.password} />
                      </Field>
                      <Field label="Country of residence" required>
                        <Select value={values.country} onValueChange={(v) => form.setValue('country', v)}>
                          <SelectTrigger size="lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c.code} value={c.code} hint={c.dial}>
                                <span className="flex items-center gap-2">
                                  <span>{c.flag}</span>
                                  {c.name}
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
                      hint="We never sell or share your details."
                    />
                  </StepShell>
                )}

                {/* ── 3 Workspace ───────────────────── */}
                {current.id === 'workspace' && (
                  <StepShell
                    title="Set up your workspace"
                    description="A workspace holds your numbers, connections, wallet and team. Most companies need just one."
                  >
                    <div className="space-y-4">
                      <Field
                        label="Workspace name"
                        required
                        error={form.formState.errors.workspaceName?.message}
                        description="Something your team will recognise."
                      >
                        <Input
                          {...form.register('workspaceName')}
                          placeholder="Acme Retail"
                          autoFocus
                          inputSize="lg"
                          aria-invalid={!!form.formState.errors.workspaceName}
                        />
                      </Field>
                      {values.accountType === 'business' && (
                        <Field
                          label="Legal business name"
                          description="Must match your commercial registration exactly — it goes on your invoices."
                        >
                          <Input
                            {...form.register('businessName')}
                            placeholder="Acme Retail LLC"
                            inputSize="lg"
                          />
                        </Field>
                      )}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Country">
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
                                    {c.name}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Currency">
                          <Select
                            value={values.currency}
                            onValueChange={(v) => form.setValue('currency', v as Currency)}
                          >
                            <SelectTrigger size="lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">US Dollar (USD)</SelectItem>
                              <SelectItem value="EGP">Egyptian Pound (EGP)</SelectItem>
                              <SelectItem value="EUR">Euro (EUR)</SelectItem>
                              <SelectItem value="AED">UAE Dirham (AED)</SelectItem>
                              <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                      <Field label="Timezone" description="Reports and scheduled exports use this.">
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
                    title="What are you building?"
                    description="This only shapes the tips and examples we show you — nothing is locked either way."
                  >
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {USE_CASES.map((u, i) => {
                        const active = values.useCase === u.id
                        return (
                          <motion.button
                            key={u.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.035, duration: 0.3, ease: EASE }}
                            onClick={() => form.setValue('useCase', u.id)}
                            className={cn(
                              'flex flex-col items-start gap-1 rounded-2xl p-3.5 text-left transition-all duration-150',
                              active ? 'bg-brand-softer ring-1 ring-brand/40' : 'veil hover:bg-veil-strong',
                            )}
                          >
                            <span
                              className={cn('text-sm font-semibold', active ? 'text-brand-ink' : 'text-ink')}
                            >
                              {u.label}
                            </span>
                            <span className="text-xs leading-relaxed text-ink-subtle">{u.blurb}</span>
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
                    title="Verify your identity"
                    description={
                      values.accountType === 'business'
                        ? 'Egypt requires a verified business entity before national, mobile and toll-free numbers can be provisioned. Most reviews finish within a few hours.'
                        : 'Egypt requires identity verification before certain number ranges can be provisioned. Most reviews finish within a few hours.'
                    }
                  >
                    <Alert tone="brand" compact className="mb-4" icon={<ShieldCheck />}>
                      You can skip this and start with a local number today — we'll remind you when you reach a
                      range that needs it.
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
                        {docs.length - 3} more document{docs.length - 3 === 1 ? '' : 's'} can be added from the
                        verification page after setup.
                      </p>
                    )}
                    <Nav
                      onBack={() => go(4)}
                      onNext={() => {
                        if (uploadedDocs > 0) submitVerification()
                        go(6)
                      }}
                      nextLabel={uploadedDocs > 0 ? 'Submit and continue' : 'Continue'}
                      secondary={
                        uploadedDocs === 0 ? (
                          <Button variant="ghost" onClick={() => go(6)} className="text-ink-subtle">
                            Do this later
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
                    title="How would you like to pay?"
                    description="Start with pay as you go — you can move to a committed plan any time, and discounts apply automatically as volume grows."
                  >
                    <div className="space-y-3">
                      {[
                        {
                          value: 'payg' as const,
                          icon: Rocket,
                          label: 'Pay as you go',
                          price: 'No commitment',
                          blurb: 'Perfect for startups and first integrations.',
                          perks: [
                            'Top up your wallet, pay only for usage',
                            `Numbers from ${money(1.1, values.currency as Currency)}/month`,
                            'Every API and SIP feature included',
                            'Cancel or pause whenever',
                          ],
                        },
                        {
                          value: 'volume' as const,
                          icon: TrendingDown,
                          label: 'Volume pricing',
                          price: 'Up to 24% lower',
                          blurb: 'For predictable monthly traffic.',
                          perks: [
                            'Committed monthly minutes at lower rates',
                            'Dedicated carrier routes and priority capacity',
                            'Named technical account manager',
                            'Custom SLA and net-30 invoicing',
                          ],
                        },
                      ].map((p) => {
                        const active = plan === p.value
                        return (
                          <button
                            key={p.value}
                            onClick={() => setPlan(p.value)}
                            className={cn(
                              'flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-all duration-200',
                              active ? 'bg-brand-softer ring-1 ring-brand/40' : 'veil hover:bg-veil-strong',
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
                      nextLabel="Create my workspace"
                      nextDisabled={!plan}
                      loading={creating}
                      hint="No card is charged today. Volume plans start with a call from our team."
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
                        {values.workspaceName || 'Your workspace'} is ready
                      </h1>
                      <p className="mx-auto mt-3 max-w-md text-md leading-relaxed text-ink-muted">
                        One thing left: give your workspace a phone number. Local Cairo lines activate the
                        moment you check out.
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
                        Buy your first phone number
                        <ArrowRight className="size-[18px]" />
                      </Button>
                      <Button variant="ghost" size="lg" block onClick={() => leave('/')}>
                        Take me to the dashboard
                      </Button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-10 grid gap-2.5 text-left sm:grid-cols-3"
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
                          <p className="mt-2 text-sm font-semibold text-ink">{f.t}</p>
                          <p className="mt-0.5 text-xs text-ink-subtle">{f.d}</p>
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
            By continuing you agree to the acceptable use policy and local telecom regulations.
          </p>
        </div>
      </main>
    </div>
  )
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
  nextLabel = 'Continue',
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
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="lg" onClick={onBack} icon={<ArrowLeft />} className="text-ink-subtle">
          Back
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {secondary}
          <Button variant="primary" size="lg" onClick={onNext} disabled={nextDisabled} loading={loading}>
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
      {hint && <p className="mt-3 text-xs leading-relaxed text-ink-faint">{hint}</p>}
    </div>
  )
}

function PasswordStrength({ value }: { value: string }) {
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
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}
