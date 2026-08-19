export type Currency = 'USD' | 'EGP' | 'EUR' | 'AED' | 'GBP'

export type Capability = 'voice' | 'sms' | 'mms' | 'fax'
export type NumberType = 'local' | 'mobile' | 'national' | 'tollfree'

export type NumberStatus = 'active' | 'provisioning' | 'pending_verification' | 'porting' | 'suspended'
export type ComplianceState = 'not_required' | 'required' | 'submitted' | 'approved' | 'rejected'

export interface CountryMeta {
  code: string
  name: string
  dial: string
  flag: string
  live: boolean
  regulated: boolean
  regions: { name: string; cities: string[]; areaCode: string }[]
  note?: string
}

/**
 * The underlying carrier a range belongs to. Numbers are resold, so the carrier
 * is a property of the range, not of the workspace.
 */
export type CarrierId = 'we' | 'vodafone' | 'etisalat'

export interface PhoneNumber {
  id: string
  e164: string
  carrier: CarrierId
  country: string
  region: string
  city: string
  type: NumberType
  capabilities: Capability[]
  monthly: number
  setup: number
  availableCount: number
  requiresRegulatoryDocs: boolean
  isNew?: boolean
}

export interface OwnedNumber extends PhoneNumber {
  label?: string
  status: NumberStatus
  purchasedAt: string
  connectionId?: string
  applicationId?: string
  callerIdName?: string
  webhookUrl?: string
  webhookFailover?: string
  /** Plain forwarding — an E.164 destination we bridge inbound calls to. */
  forwardTo?: string
  /**
   * When forwarding applies. 'always' makes it the number's primary destination;
   * the other two layer it over a trunk, webhook or agent as a safety net, which
   * is why forwarding is its own setting rather than only a routing choice.
   */
  forwardWhen?: 'always' | 'unanswered' | 'unreachable'
  /** Seconds to ring the destination before giving up. */
  forwardTimeout?: number
  /** Where the call goes if the forward destination never answers. */
  forwardFallback?: 'voicemail' | 'busy' | 'hangup'
  emergencyAddress?: string
  compliance: ComplianceState
  smsEnabled: boolean
  recordingEnabled: boolean
  cnamEnabled: boolean
  tags: string[]
  usage: { minutes: number; calls: number; messages: number; spend: number }
}

/** True once a number has any destination at all — trunk, forward or webhook. */
export function isRouted(n: OwnedNumber): boolean {
  const forwardIsPrimary = !!n.forwardTo && (n.forwardWhen ?? 'always') === 'always'
  return !!(n.connectionId || n.webhookUrl || forwardIsPrimary)
}

export type SipAuthMode = 'credential' | 'ip' | 'fqdn'
export type SipStatus = 'active' | 'degraded' | 'offline' | 'provisioning'
export type SipTransport = 'udp' | 'tcp' | 'tls'

export interface SipConnection {
  id: string
  name: string
  authMode: SipAuthMode
  status: SipStatus
  transport: SipTransport
  srtp: boolean
  region: string
  createdAt: string
  channelLimit: number
  concurrentCalls: number
  username?: string
  password?: string
  fqdn?: string
  allowedIps: { ip: string; port: number; label: string }[]
  inbound: {
    codecs: string[]
    dtmfType: 'RFC 2833' | 'Inband' | 'SIP INFO'
    encryptedMedia: boolean
    ani: 'e164' | 'national'
    failoverUri?: string
  }
  outbound: {
    localization: string
    callerIdOverride?: string
    channelLimit: number
    tech_prefix?: string
    t38: boolean
  }
  health: { latencyMs: number; asr: number; mos: number; packetLoss: number; jitterMs: number }
  numbersAssigned: number
  stats: { minutes: number; calls: number; spend: number }
}

export type TxKind = 'topup' | 'usage' | 'number' | 'refund' | 'adjustment' | 'commitment'
export type TxStatus = 'succeeded' | 'pending' | 'failed'

export interface Transaction {
  id: string
  kind: TxKind
  description: string
  amount: number
  status: TxStatus
  createdAt: string
  method?: string
  reference?: string
}

export interface Invoice {
  id: string
  number: string
  periodStart: string
  periodEnd: string
  amount: number
  status: 'paid' | 'open' | 'past_due'
  issuedAt: string
  dueAt: string
  lines: { label: string; qty: string; amount: number }[]
}

export interface PaymentMethod {
  id: string
  brand: 'visa' | 'mastercard' | 'amex' | 'meeza'
  last4: string
  expMonth: number
  expYear: number
  holder: string
  isDefault: boolean
}

export interface ApiKey {
  id: string
  name: string
  token: string
  createdAt: string
  lastUsedAt?: string
  scope: 'full' | 'read' | 'numbers' | 'voice'
  environment: 'live' | 'test'
  status: 'active' | 'revoked'
  requests7d: number
}

export interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  status: 'healthy' | 'failing' | 'paused'
  secret: string
  successRate: number
  lastDeliveryAt?: string
  deliveries24h: number
}

export interface RequestLog {
  id: string
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  status: number
  latencyMs: number
  at: string
  ip: string
  keyName: string
}

export type Role = 'owner' | 'admin' | 'developer' | 'billing' | 'viewer'

export interface Member {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'invited' | 'suspended'
  lastActiveAt?: string
  twoFactor: boolean
  hue: number
}

export interface AuditEvent {
  id: string
  actor: string
  action: string
  target: string
  at: string
  ip: string
  category: 'auth' | 'numbers' | 'billing' | 'sip' | 'team' | 'api'
}

export interface CallRecord {
  id: string
  direction: 'inbound' | 'outbound'
  from: string
  to: string
  startedAt: string
  seconds: number
  cost: number
  status: 'completed' | 'no_answer' | 'busy' | 'failed' | 'in_progress'
  connection: string
  mos: number
}

export interface MessageRecord {
  id: string
  direction: 'inbound' | 'outbound'
  from: string
  to: string
  at: string
  segments: number
  cost: number
  status: 'delivered' | 'sent' | 'failed' | 'queued'
  body: string
}

export type DocKind =
  | 'passport'
  | 'national_id'
  | 'commercial_registration'
  | 'tax_certificate'
  | 'business_license'
  | 'representative_id'
  | 'proof_of_address'

export type DocStatus = 'missing' | 'uploading' | 'processing' | 'submitted' | 'approved' | 'rejected'

export interface VerificationDoc {
  kind: DocKind
  status: DocStatus
  fileName?: string
  sizeBytes?: number
  uploadedAt?: string
  rejectionReason?: string
  ocr?: { field: string; value: string; confidence: number }[]
}

export type KycStage = 'not_started' | 'in_progress' | 'in_review' | 'approved' | 'rejected'

export interface Verification {
  accountType: 'individual' | 'business'
  stage: KycStage
  submittedAt?: string
  reviewedAt?: string
  estimatedHours: number
  docs: VerificationDoc[]
  timeline: { at: string; label: string; detail?: string; state: 'done' | 'active' | 'pending' | 'failed' }[]
}

export interface NotificationItem {
  id: string
  title: string
  body: string
  at: string
  read: boolean
  kind: 'verification' | 'number' | 'billing' | 'compliance' | 'system' | 'sip'
  severity: 'info' | 'success' | 'warning' | 'danger'
  href?: string
}

export interface ActivityItem {
  id: string
  actor: string
  action: string
  detail?: string
  at: string
  kind: 'number' | 'sip' | 'billing' | 'api' | 'team' | 'verification'
}

export type PlanKind = 'payg' | 'volume'

export interface Workspace {
  id: string
  name: string
  businessName: string
  country: string
  timezone: string
  currency: Currency
  plan: PlanKind
  createdAt: string
  useCase: string
}

export interface Profile {
  name: string
  email: string
  country: string
  accountType: 'individual' | 'business'
  avatarHue: number
}
