import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { DirectionProvider } from '@radix-ui/react-direction'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toast'
import { AppShell } from '@/components/layout/app-shell'
import { useThemeEffect } from '@/hooks/use-theme'
import { useApplyLocale, useI18n } from '@/lib/i18n'
import { RouteFallback } from '@/components/shared/route-fallback'
import { useApp } from '@/store/app'

const Dashboard = lazy(() => import('@/features/dashboard/dashboard-page'))
const LandingPage = lazy(() => import('@/features/landing/landing-page'))
const LoginPage = lazy(() => import('@/features/auth/login-page'))
const SignupPage = lazy(() => import('@/features/auth/signup-page'))
const NumbersPage = lazy(() => import('@/features/numbers/numbers-page'))
const MarketplacePage = lazy(() => import('@/features/numbers/marketplace-page'))
const CheckoutPage = lazy(() => import('@/features/numbers/checkout-page'))
const NumberDetailPage = lazy(() => import('@/features/numbers/number-detail-page'))
const NumberSetupPage = lazy(() => import('@/features/numbers/number-setup-page'))
const SipPage = lazy(() => import('@/features/sip/sip-page'))
const SipDetailPage = lazy(() => import('@/features/sip/sip-detail-page'))
const AnalyticsPage = lazy(() => import('@/features/analytics/analytics-page'))
const BillingPage = lazy(() => import('@/features/billing/billing-page'))
const PricingPage = lazy(() => import('@/features/pricing/pricing-page'))
const ApiKeysPage = lazy(() => import('@/features/developers/api-keys-page'))
const WebhooksPage = lazy(() => import('@/features/developers/webhooks-page'))
const LogsPage = lazy(() => import('@/features/developers/logs-page'))
const VerificationPage = lazy(() => import('@/features/verification/verification-page'))
const TeamPage = lazy(() => import('@/features/team/team-page'))
const SettingsPage = lazy(() => import('@/features/settings/settings-page'))
const OnboardingFlow = lazy(() => import('@/features/onboarding/onboarding-flow'))
const NotFoundPage = lazy(() => import('@/features/shell/not-found-page'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
})

/**
 * Puts the two document-level preferences on <html> before anything renders:
 * `data-theme` for the palette, and `lang`/`dir` for the writing direction.
 * `dir` is what drives every logical property in the stylesheet, so this is the
 * single switch that mirrors the entire product.
 */
function DocumentGate({ children }: { children: React.ReactNode }) {
  useThemeEffect()
  useApplyLocale()
  return <>{children}</>
}

/**
 * Radix primitives don't read <html dir>; they take direction from this context.
 * Without it, menu alignment and arrow-key navigation in tabs and sliders stay
 * left-to-right while everything around them has mirrored.
 */
function RadixDirection({ children }: { children: React.ReactNode }) {
  const { dir } = useI18n()
  return <DirectionProvider dir={dir}>{children}</DirectionProvider>
}

/**
 * Everything inside the shell needs an account. A visitor who deep-links into
 * the product is sent to onboarding; the root is handled separately, because
 * that is where the landing page lives.
 */
function RequireOnboarding() {
  const hasOnboarded = useApp((s) => s.hasOnboarded)
  if (!hasOnboarded) return <Navigate to="/welcome" replace />
  return <AppShell />
}

/**
 * The root is the marketing page for a visitor and the dashboard for a
 * customer. Same URL, because that is what people type and what they bookmark.
 */
function Root() {
  const hasOnboarded = useApp((s) => s.hasOnboarded)
  return hasOnboarded ? <AppShell /> : <LandingPage />
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DocumentGate>
        {/* reducedMotion="user" makes every Framer animation honour the OS setting,
            which the CSS media query alone cannot do for JS-driven motion. */}
        <MotionConfig reducedMotion="user">
          <RadixDirection>
            <TooltipProvider delayDuration={280} skipDelayDuration={400}>
              <BrowserRouter>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/welcome/*" element={<OnboardingFlow />} />
                    {/* Auth sits outside the shell and outside `RequireOnboarding`:
                        these are the two pages someone reaches with no account at
                        all, so neither can depend on having one. */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    {/* Always reachable, so someone who already has an account
                        can still open the marketing page. */}
                    <Route path="/landing" element={<LandingPage />} />
                    {/* The root resolves to the shell or the landing page; the
                        index child only renders when the shell wins, because the
                        landing page has no Outlet. */}
                    <Route path="/" element={<Root />}>
                      <Route index element={<Dashboard />} />
                    </Route>
                    <Route element={<RequireOnboarding />}>
                      <Route path="/numbers" element={<NumbersPage />} />
                      <Route path="/numbers/buy" element={<MarketplacePage />} />
                      <Route path="/numbers/checkout" element={<CheckoutPage />} />
                      <Route path="/numbers/:id" element={<NumberDetailPage />} />
                      <Route path="/numbers/:id/setup" element={<NumberSetupPage />} />
                      <Route path="/sip" element={<SipPage />} />
                      <Route path="/sip/:id" element={<SipDetailPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/billing" element={<BillingPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/developers" element={<ApiKeysPage />} />
                      <Route path="/developers/webhooks" element={<WebhooksPage />} />
                      <Route path="/developers/logs" element={<LogsPage />} />
                      <Route path="/verification" element={<VerificationPage />} />
                      <Route path="/team" element={<TeamPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/dashboard" element={<Navigate to="/" replace />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Routes>
                </Suspense>
                <Toaster />
              </BrowserRouter>
            </TooltipProvider>
          </RadixDirection>
        </MotionConfig>
      </DocumentGate>
    </QueryClientProvider>
  )
}
