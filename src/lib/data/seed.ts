import type {
  ActivityItem,
  ApiKey,
  AuditEvent,
  CallRecord,
  Invoice,
  Member,
  MessageRecord,
  NotificationItem,
  OwnedNumber,
  PaymentMethod,
  RequestLog,
  SipConnection,
  Transaction,
  WebhookEndpoint,
} from '../types'
import { mulberry, range } from '../utils'

const rnd = mulberry(20260819)
const now = Date.now()
const HOUR = 3_600_000
const DAY = 86_400_000
const ago = (ms: number) => new Date(now - ms).toISOString()

export const seedNumbers = (): OwnedNumber[] => [
  {
    id: 'num_20224618890',
    e164: '+20224618890',
    carrier: 'we',
    country: 'EG',
    region: 'Cairo',
    city: 'New Cairo',
    type: 'local',
    capabilities: ['voice', 'sms'],
    monthly: 1.1,
    setup: 0,
    availableCount: 1,
    requiresRegulatoryDocs: false,
    label: 'Support line — Cairo',
    status: 'active',
    purchasedAt: ago(64 * DAY),
    connectionId: 'sip_prod_edge',
    callerIdName: 'Zoetel Support',
    webhookUrl: 'https://api.acme.eg/voice/inbound',
    webhookFailover: 'https://api-eu.acme.eg/voice/inbound',
    emergencyAddress: '12 Road 90, New Cairo, Cairo',
    compliance: 'approved',
    smsEnabled: true,
    recordingEnabled: true,
    cnamEnabled: true,
    tags: ['support', 'production'],
    usage: { minutes: 4820, calls: 1912, messages: 640, spend: 143.28 },
  },
  {
    id: 'num_201028834471',
    e164: '+201028834471',
    carrier: 'vodafone',
    country: 'EG',
    region: 'Cairo',
    city: 'Cairo',
    type: 'mobile',
    capabilities: ['voice', 'sms', 'mms'],
    monthly: 2.4,
    setup: 0.5,
    availableCount: 1,
    requiresRegulatoryDocs: true,
    label: 'AI agent — outbound',
    status: 'active',
    purchasedAt: ago(41 * DAY),
    connectionId: 'sip_ai_agent',
    callerIdName: 'Acme Retail',
    webhookUrl: 'https://agent.acme.eg/hooks/telephony',
    compliance: 'approved',
    smsEnabled: true,
    recordingEnabled: false,
    cnamEnabled: true,
    tags: ['ai-agent'],
    usage: { minutes: 12640, calls: 8204, messages: 2140, spend: 512.9 },
  },
  {
    id: 'num_20168822',
    e164: '+20168822',
    carrier: 'we',
    country: 'EG',
    region: 'Cairo',
    city: 'Nationwide',
    type: 'national',
    capabilities: ['voice'],
    monthly: 4.5,
    setup: 2,
    availableCount: 1,
    requiresRegulatoryDocs: true,
    label: 'Hotline 16 8822',
    status: 'pending_verification',
    purchasedAt: ago(3 * DAY),
    compliance: 'submitted',
    smsEnabled: false,
    recordingEnabled: true,
    cnamEnabled: false,
    tags: ['hotline'],
    usage: { minutes: 0, calls: 0, messages: 0, spend: 0 },
  },
  {
    id: 'num_20334129077',
    e164: '+20334129077',
    carrier: 'etisalat',
    country: 'EG',
    region: 'Alexandria',
    city: 'Alexandria',
    type: 'local',
    capabilities: ['voice', 'sms', 'fax'],
    monthly: 1.05,
    setup: 0,
    availableCount: 1,
    requiresRegulatoryDocs: false,
    label: 'Alexandria branch',
    status: 'active',
    purchasedAt: ago(22 * DAY),
    connectionId: 'sip_prod_edge',
    callerIdName: 'Acme Alexandria',
    compliance: 'approved',
    smsEnabled: true,
    recordingEnabled: false,
    cnamEnabled: false,
    tags: ['branch'],
    usage: { minutes: 1180, calls: 502, messages: 88, spend: 38.4 },
  },
  {
    id: 'num_9714567220',
    e164: '+9714567220',
    carrier: 'etisalat',
    country: 'AE',
    region: 'Dubai',
    city: 'Dubai',
    type: 'local',
    capabilities: ['voice'],
    monthly: 3.5,
    setup: 0,
    availableCount: 1,
    requiresRegulatoryDocs: true,
    label: 'Dubai sales',
    status: 'active',
    purchasedAt: ago(11 * DAY),
    connectionId: 'sip_prod_edge',
    compliance: 'approved',
    smsEnabled: false,
    recordingEnabled: true,
    cnamEnabled: false,
    tags: ['sales', 'gulf'],
    usage: { minutes: 940, calls: 388, messages: 0, spend: 44.12 },
  },
  {
    id: 'num_20800115533',
    e164: '+208001155',
    carrier: 'we',
    country: 'EG',
    region: 'Cairo',
    city: 'Nationwide',
    type: 'tollfree',
    capabilities: ['voice'],
    monthly: 9,
    setup: 3,
    availableCount: 1,
    requiresRegulatoryDocs: true,
    label: 'Toll-free care',
    status: 'active',
    purchasedAt: ago(75 * DAY),
    connectionId: 'sip_contact_center',
    callerIdName: 'Acme Care',
    webhookUrl: 'https://api.acme.eg/voice/care',
    compliance: 'approved',
    smsEnabled: false,
    recordingEnabled: true,
    cnamEnabled: true,
    tags: ['care', 'production'],
    usage: { minutes: 9310, calls: 4102, messages: 0, spend: 388.6 },
  },
]

export const seedConnections = (): SipConnection[] => [
  {
    id: 'sip_prod_edge',
    name: 'Production Edge',
    authMode: 'credential',
    status: 'active',
    transport: 'tls',
    srtp: true,
    region: 'Cairo (eg-cai-1)',
    createdAt: ago(64 * DAY),
    channelLimit: 200,
    concurrentCalls: 37,
    username: 'acme_prod_edge',
    password: 'Kx7$pQm2vLdN9wTz',
    allowedIps: [],
    inbound: {
      codecs: ['OPUS', 'G722', 'PCMA', 'PCMU'],
      dtmfType: 'RFC 2833',
      encryptedMedia: true,
      ani: 'e164',
      failoverUri: 'sip:failover.acme.eg:5061;transport=tls',
    },
    outbound: { localization: 'EG', callerIdOverride: '+20224618890', channelLimit: 120, t38: false },
    health: { latencyMs: 18, asr: 71.4, mos: 4.36, packetLoss: 0.02, jitterMs: 4 },
    numbersAssigned: 3,
    stats: { minutes: 6940, calls: 2814, spend: 219.4 },
  },
  {
    id: 'sip_ai_agent',
    name: 'AI Voice Agent',
    authMode: 'fqdn',
    status: 'active',
    transport: 'tls',
    srtp: true,
    region: 'Cairo (eg-cai-1)',
    createdAt: ago(41 * DAY),
    channelLimit: 500,
    concurrentCalls: 112,
    fqdn: 'agent.acme.eg',
    allowedIps: [],
    inbound: {
      codecs: ['OPUS', 'PCMA'],
      dtmfType: 'RFC 2833',
      encryptedMedia: true,
      ani: 'e164',
    },
    outbound: { localization: 'EG', channelLimit: 400, t38: false, tech_prefix: 'ai' },
    health: { latencyMs: 11, asr: 84.2, mos: 4.48, packetLoss: 0.01, jitterMs: 2 },
    numbersAssigned: 1,
    stats: { minutes: 12640, calls: 8204, spend: 512.9 },
  },
  {
    id: 'sip_contact_center',
    name: 'Contact Center (Genesys)',
    authMode: 'ip',
    status: 'degraded',
    transport: 'udp',
    srtp: false,
    region: 'Frankfurt (eu-fra-1)',
    createdAt: ago(120 * DAY),
    channelLimit: 300,
    concurrentCalls: 84,
    allowedIps: [
      { ip: '41.33.87.12', port: 5060, label: 'Cairo DC — primary' },
      { ip: '41.33.87.13', port: 5060, label: 'Cairo DC — standby' },
      { ip: '156.160.4.201', port: 5060, label: 'Alexandria DR' },
    ],
    inbound: {
      codecs: ['PCMA', 'PCMU', 'G729'],
      dtmfType: 'Inband',
      encryptedMedia: false,
      ani: 'national',
      failoverUri: 'sip:dr.acme.eg:5060',
    },
    outbound: { localization: 'EG', channelLimit: 200, t38: true },
    health: { latencyMs: 68, asr: 58.1, mos: 3.62, packetLoss: 1.4, jitterMs: 19 },
    numbersAssigned: 1,
    stats: { minutes: 9310, calls: 4102, spend: 388.6 },
  },
  {
    id: 'sip_lab',
    name: 'Lab / Staging',
    authMode: 'credential',
    status: 'offline',
    transport: 'tcp',
    srtp: false,
    region: 'Cairo (eg-cai-1)',
    createdAt: ago(9 * DAY),
    channelLimit: 20,
    concurrentCalls: 0,
    username: 'acme_lab',
    password: 'Lb2#tR8kWq4mZs1x',
    allowedIps: [],
    inbound: { codecs: ['PCMA', 'PCMU'], dtmfType: 'RFC 2833', encryptedMedia: false, ani: 'e164' },
    outbound: { localization: 'EG', channelLimit: 10, t38: false },
    health: { latencyMs: 0, asr: 0, mos: 0, packetLoss: 0, jitterMs: 0 },
    numbersAssigned: 0,
    stats: { minutes: 12, calls: 8, spend: 0.4 },
  },
]

export const seedTransactions = (): Transaction[] => [
  {
    id: 'tx_01',
    kind: 'topup',
    description: 'Wallet top-up',
    amount: 500,
    status: 'succeeded',
    createdAt: ago(2 * DAY),
    method: 'Visa •• 4242',
    reference: 'ch_3Qk8xR',
  },
  {
    id: 'tx_02',
    kind: 'usage',
    description: 'Voice usage — Aug 1–18',
    amount: -284.61,
    status: 'succeeded',
    createdAt: ago(4 * HOUR),
  },
  {
    id: 'tx_03',
    kind: 'number',
    description: 'Number +20 16 8822 — setup & first month',
    amount: -6.5,
    status: 'succeeded',
    createdAt: ago(3 * DAY),
  },
  {
    id: 'tx_04',
    kind: 'usage',
    description: 'SMS usage — Aug 1–18',
    amount: -41.2,
    status: 'succeeded',
    createdAt: ago(6 * HOUR),
  },
  {
    id: 'tx_05',
    kind: 'topup',
    description: 'Auto-recharge triggered',
    amount: 250,
    status: 'succeeded',
    createdAt: ago(9 * DAY),
    method: 'Visa •• 4242',
    reference: 'ch_3Qj1mB',
  },
  {
    id: 'tx_06',
    kind: 'number',
    description: 'Number +971 4 567 220 — first month',
    amount: -3.5,
    status: 'succeeded',
    createdAt: ago(11 * DAY),
  },
  {
    id: 'tx_07',
    kind: 'topup',
    description: 'Wallet top-up',
    amount: 100,
    status: 'failed',
    createdAt: ago(14 * DAY),
    method: 'Mastercard •• 8891',
    reference: 'ch_3Qh0zL',
  },
  {
    id: 'tx_08',
    kind: 'adjustment',
    description: 'Service credit — SIP degradation Jul 29',
    amount: 24.5,
    status: 'succeeded',
    createdAt: ago(20 * DAY),
  },
  {
    id: 'tx_09',
    kind: 'usage',
    description: 'Voice usage — July',
    amount: -612.44,
    status: 'succeeded',
    createdAt: ago(30 * DAY),
  },
  {
    id: 'tx_10',
    kind: 'topup',
    description: 'Wallet top-up',
    amount: 1000,
    status: 'succeeded',
    createdAt: ago(31 * DAY),
    method: 'Bank transfer',
    reference: 'bt_88213',
  },
  {
    id: 'tx_11',
    kind: 'refund',
    description: 'Refund — released number +20 3 4419002',
    amount: 1.05,
    status: 'succeeded',
    createdAt: ago(36 * DAY),
  },
  {
    id: 'tx_12',
    kind: 'usage',
    description: 'Voice usage — June',
    amount: -448.9,
    status: 'succeeded',
    createdAt: ago(60 * DAY),
  },
]

export const seedInvoices = (): Invoice[] => [
  {
    id: 'in_2026_07',
    number: 'ZTL-2026-0007',
    periodStart: ago(49 * DAY),
    periodEnd: ago(19 * DAY),
    amount: 741.18,
    status: 'paid',
    issuedAt: ago(18 * DAY),
    dueAt: ago(4 * DAY),
    lines: [
      { label: 'Voice — outbound minutes', qty: '18,420 min', amount: 512.4 },
      { label: 'Voice — inbound minutes', qty: '9,120 min', amount: 118.56 },
      { label: 'SMS — outbound', qty: '4,210 msgs', amount: 63.15 },
      { label: 'Phone numbers', qty: '6 numbers', amount: 21.55 },
      { label: 'SIP channels', qty: '1,020 channels', amount: 25.52 },
    ],
  },
  {
    id: 'in_2026_06',
    number: 'ZTL-2026-0006',
    periodStart: ago(80 * DAY),
    periodEnd: ago(50 * DAY),
    amount: 596.04,
    status: 'paid',
    issuedAt: ago(49 * DAY),
    dueAt: ago(35 * DAY),
    lines: [
      { label: 'Voice — outbound minutes', qty: '14,880 min', amount: 402.1 },
      { label: 'Voice — inbound minutes', qty: '7,640 min', amount: 99.32 },
      { label: 'SMS — outbound', qty: '3,120 msgs', amount: 46.8 },
      { label: 'Phone numbers', qty: '5 numbers', amount: 18.05 },
      { label: 'SIP channels', qty: '1,180 channels', amount: 29.77 },
    ],
  },
  {
    id: 'in_2026_08',
    number: 'ZTL-2026-0008',
    periodStart: ago(18 * DAY),
    periodEnd: new Date(now + 12 * DAY).toISOString(),
    amount: 325.81,
    status: 'open',
    issuedAt: ago(18 * DAY),
    dueAt: new Date(now + 14 * DAY).toISOString(),
    lines: [
      { label: 'Voice — outbound minutes', qty: '9,880 min (so far)', amount: 232.4 },
      { label: 'Voice — inbound minutes', qty: '4,120 min (so far)', amount: 52.21 },
      { label: 'SMS — outbound', qty: '2,748 msgs', amount: 41.2 },
    ],
  },
]

export const seedPaymentMethods = (): PaymentMethod[] => [
  {
    id: 'pm_1',
    brand: 'visa',
    last4: '4242',
    expMonth: 8,
    expYear: 2029,
    holder: 'Acme Retail LLC',
    isDefault: true,
  },
  {
    id: 'pm_2',
    brand: 'meeza',
    last4: '9013',
    expMonth: 3,
    expYear: 2028,
    holder: 'Youssef Hegazy',
    isDefault: false,
  },
]

export const seedApiKeys = (): ApiKey[] => [
  {
    id: 'key_live_1',
    name: 'Production server',
    token: 'ztl_live_9K2mQx7pRvL4nT8wZa1cYbE6',
    createdAt: ago(60 * DAY),
    lastUsedAt: ago(4 * 60_000),
    scope: 'full',
    environment: 'live',
    status: 'active',
    requests7d: 1_284_902,
  },
  {
    id: 'key_live_2',
    name: 'AI agent worker',
    token: 'ztl_live_4Tn8sBw2XkP9qMv3LzD7Hj5R',
    createdAt: ago(41 * DAY),
    lastUsedAt: ago(38 * 60_000),
    scope: 'voice',
    environment: 'live',
    status: 'active',
    requests7d: 418_330,
  },
  {
    id: 'key_test_1',
    name: 'Local development',
    token: 'ztl_test_1Ab2Cd3Ef4Gh5Ij6Kl7Mn8Op',
    createdAt: ago(12 * DAY),
    lastUsedAt: ago(3 * HOUR),
    scope: 'full',
    environment: 'test',
    status: 'active',
    requests7d: 2_104,
  },
  {
    id: 'key_live_old',
    name: 'Legacy dialer (rotated)',
    token: 'ztl_live_0Zz9Yy8Xx7Ww6Vv5Uu4Tt3Ss',
    createdAt: ago(180 * DAY),
    lastUsedAt: ago(45 * DAY),
    scope: 'read',
    environment: 'live',
    status: 'revoked',
    requests7d: 0,
  },
]

export const seedWebhooks = (): WebhookEndpoint[] => [
  {
    id: 'wh_1',
    url: 'https://api.acme.eg/webhooks/zoetel',
    events: ['call.initiated', 'call.answered', 'call.hangup', 'message.received'],
    status: 'healthy',
    secret: 'whsec_8Kd2mPq7Rv',
    successRate: 99.98,
    lastDeliveryAt: ago(40_000),
    deliveries24h: 48_213,
  },
  {
    id: 'wh_2',
    url: 'https://agent.acme.eg/hooks/telephony',
    events: ['call.machine.detection.ended', 'call.dtmf.received', 'streaming.started'],
    status: 'healthy',
    secret: 'whsec_2Xn9wLb4Tz',
    successRate: 99.72,
    lastDeliveryAt: ago(3 * 60_000),
    deliveries24h: 12_884,
  },
  {
    id: 'wh_3',
    url: 'https://hooks.zapier.com/hooks/catch/88213/ztl',
    events: ['number.purchased', 'verification.updated'],
    status: 'failing',
    secret: 'whsec_5Qp1vKm8Rd',
    successRate: 62.4,
    lastDeliveryAt: ago(26 * 60_000),
    deliveries24h: 41,
  },
]

const PATHS = [
  ['POST', '/v2/calls'],
  ['GET', '/v2/available_phone_numbers'],
  ['POST', '/v2/number_orders'],
  ['GET', '/v2/phone_numbers'],
  ['PATCH', '/v2/phone_numbers/num_20224618890'],
  ['POST', '/v2/calls/cc_8821/actions/answer'],
  ['GET', '/v2/sip_connections'],
  ['POST', '/v2/messages'],
  ['GET', '/v2/balance'],
] as const

export const seedRequestLogs = (): RequestLog[] =>
  range(28).map((i) => {
    const [method, path] = PATHS[Math.floor(rnd() * PATHS.length)]
    const r = rnd()
    const status = r > 0.94 ? (r > 0.98 ? 500 : 422) : method === 'POST' ? 201 : 200
    return {
      id: `req_${i}`,
      method: method as RequestLog['method'],
      path,
      status,
      latencyMs: Math.round(12 + rnd() * 180),
      at: ago(i * 47_000 + Math.floor(rnd() * 20_000)),
      ip: `41.33.87.${10 + Math.floor(rnd() * 40)}`,
      keyName: rnd() > 0.4 ? 'Production server' : 'AI agent worker',
    }
  })

export const seedMembers = (): Member[] => [
  {
    id: 'mem_1',
    name: 'Youssef Hegazy',
    email: 'youssef@acmeretail.eg',
    role: 'owner',
    status: 'active',
    lastActiveAt: ago(2 * 60_000),
    twoFactor: true,
    hue: 249,
  },
  {
    id: 'mem_2',
    name: 'Nour Abdelrahman',
    email: 'nour@acmeretail.eg',
    role: 'admin',
    status: 'active',
    lastActiveAt: ago(3 * HOUR),
    twoFactor: true,
    hue: 174,
  },
  {
    id: 'mem_3',
    name: 'Karim Farouk',
    email: 'karim@acmeretail.eg',
    role: 'developer',
    status: 'active',
    lastActiveAt: ago(28 * 60_000),
    twoFactor: false,
    hue: 22,
  },
  {
    id: 'mem_4',
    name: 'Mariam Saeed',
    email: 'mariam@acmeretail.eg',
    role: 'billing',
    status: 'active',
    lastActiveAt: ago(2 * DAY),
    twoFactor: true,
    hue: 320,
  },
  {
    id: 'mem_5',
    name: 'Omar Tarek',
    email: 'omar.tarek@acmeretail.eg',
    role: 'viewer',
    status: 'invited',
    twoFactor: false,
    hue: 205,
  },
]

export const seedAudit = (): AuditEvent[] => [
  {
    id: 'ae_1',
    actor: 'Youssef Hegazy',
    action: 'Purchased phone number',
    target: '+20 16 8822',
    at: ago(3 * DAY),
    ip: '41.33.87.12',
    category: 'numbers',
  },
  {
    id: 'ae_2',
    actor: 'Karim Farouk',
    action: 'Created API key',
    target: 'Local development',
    at: ago(12 * DAY),
    ip: '156.160.4.201',
    category: 'api',
  },
  {
    id: 'ae_3',
    actor: 'Nour Abdelrahman',
    action: 'Updated SIP connection',
    target: 'Contact Center (Genesys)',
    at: ago(5 * DAY),
    ip: '41.33.87.13',
    category: 'sip',
  },
  {
    id: 'ae_4',
    actor: 'System',
    action: 'Auto-recharge succeeded',
    target: '$250.00',
    at: ago(9 * DAY),
    ip: '—',
    category: 'billing',
  },
  {
    id: 'ae_5',
    actor: 'Youssef Hegazy',
    action: 'Invited member',
    target: 'omar.tarek@acmeretail.eg',
    at: ago(6 * DAY),
    ip: '41.33.87.12',
    category: 'team',
  },
  {
    id: 'ae_6',
    actor: 'Karim Farouk',
    action: 'Signed in',
    target: 'Chrome · Cairo, EG',
    at: ago(28 * 60_000),
    ip: '156.160.4.201',
    category: 'auth',
  },
  {
    id: 'ae_7',
    actor: 'Youssef Hegazy',
    action: 'Revoked API key',
    target: 'Legacy dialer',
    at: ago(45 * DAY),
    ip: '41.33.87.12',
    category: 'api',
  },
]

const FROM_POOL = ['+201028834471', '+20224618890', '+208001155', '+20334129077', '+9714567220']
const TO_POOL = [
  '+201115540982',
  '+201220983311',
  '+201554478120',
  '+20226703388',
  '+971505512884',
  '+966501122334',
]

export const seedCalls = (): CallRecord[] =>
  range(24).map((i) => {
    const outbound = rnd() > 0.42
    const r = rnd()
    // Roughly a 72% answer-seizure ratio, which is what healthy Egyptian
    // mobile termination actually looks like.
    const status: CallRecord['status'] =
      r > 0.8 ? 'no_answer' : r > 0.76 ? 'busy' : r > 0.72 ? 'failed' : 'completed'
    const seconds = status === 'completed' ? Math.round(18 + rnd() * 420) : Math.round(rnd() * 12)
    return {
      id: `cc_${(88210 + i).toString(36)}`,
      direction: outbound ? 'outbound' : 'inbound',
      from: outbound
        ? FROM_POOL[Math.floor(rnd() * FROM_POOL.length)]
        : TO_POOL[Math.floor(rnd() * TO_POOL.length)],
      to: outbound
        ? TO_POOL[Math.floor(rnd() * TO_POOL.length)]
        : FROM_POOL[Math.floor(rnd() * FROM_POOL.length)],
      startedAt: ago(i * 11 * 60_000 + Math.floor(rnd() * 400_000)),
      seconds,
      cost: Math.round(seconds * (0.0062 / 60) * 10000) / 10000,
      status,
      connection: ['Production Edge', 'AI Voice Agent', 'Contact Center (Genesys)'][Math.floor(rnd() * 3)],
      mos: Math.round((3.6 + rnd() * 0.85) * 100) / 100,
    }
  })

const BODIES = [
  'Your Acme order #88213 is out for delivery.',
  'Verification code: 704 118. Valid for 10 minutes.',
  'Reply YES to confirm your appointment on Thursday.',
  'Thanks — your refund has been processed.',
  'STOP',
]

export const seedMessages = (): MessageRecord[] =>
  range(16).map((i) => {
    const outbound = rnd() > 0.3
    const r = rnd()
    return {
      id: `msg_${(4410 + i).toString(36)}`,
      direction: outbound ? 'outbound' : 'inbound',
      from: outbound ? '+201028834471' : TO_POOL[Math.floor(rnd() * TO_POOL.length)],
      to: outbound ? TO_POOL[Math.floor(rnd() * TO_POOL.length)] : '+201028834471',
      at: ago(i * 26 * 60_000 + Math.floor(rnd() * 600_000)),
      segments: 1 + (rnd() > 0.8 ? 1 : 0),
      cost: 0.015,
      status: r > 0.95 ? 'failed' : r > 0.9 ? 'queued' : 'delivered',
      body: BODIES[Math.floor(rnd() * BODIES.length)],
    }
  })

export const seedNotifications = (): NotificationItem[] => [
  {
    id: 'nt_1',
    title: 'Business verification approved',
    body: 'Acme Retail LLC is verified. National and toll-free ranges are now available to purchase.',
    at: ago(26 * HOUR),
    read: false,
    kind: 'verification',
    severity: 'success',
    href: '/verification',
  },
  {
    id: 'nt_2',
    title: 'Regulatory documents requested',
    body: '+20 16 8822 needs an NTRA hotline authorization letter before it can go live.',
    at: ago(3 * DAY),
    read: false,
    kind: 'compliance',
    severity: 'warning',
    href: '/numbers/num_20168822',
  },
  {
    id: 'nt_3',
    title: 'SIP connection degraded',
    body: 'Contact Center (Genesys) is seeing 1.4% packet loss from 41.33.87.12.',
    at: ago(5 * HOUR),
    read: false,
    kind: 'sip',
    severity: 'danger',
    href: '/sip/sip_contact_center',
  },
  {
    id: 'nt_4',
    title: 'Number purchased',
    body: '+20 16 8822 was added to your workspace by Youssef Hegazy.',
    at: ago(3 * DAY),
    read: true,
    kind: 'number',
    severity: 'info',
    href: '/numbers',
  },
  {
    id: 'nt_5',
    title: 'Auto-recharge succeeded',
    body: '$250.00 was added to your wallet from Visa •• 4242.',
    at: ago(9 * DAY),
    read: true,
    kind: 'billing',
    severity: 'success',
    href: '/billing',
  },
  {
    id: 'nt_6',
    title: 'Webhook endpoint failing',
    body: 'hooks.zapier.com returned 5xx for 37% of deliveries in the last hour.',
    at: ago(26 * 60_000),
    read: true,
    kind: 'system',
    severity: 'warning',
    href: '/developers/webhooks',
  },
]

export const seedActivity = (): ActivityItem[] => [
  {
    id: 'ac_1',
    actor: 'Karim Farouk',
    action: 'deployed a new webhook handler',
    detail: 'agent.acme.eg',
    at: ago(18 * 60_000),
    kind: 'api',
  },
  {
    id: 'ac_2',
    actor: 'System',
    action: 'flagged Contact Center as degraded',
    detail: '1.4% packet loss',
    at: ago(5 * HOUR),
    kind: 'sip',
  },
  {
    id: 'ac_3',
    actor: 'Youssef Hegazy',
    action: 'purchased +20 16 8822',
    detail: 'National · Egypt',
    at: ago(3 * DAY),
    kind: 'number',
  },
  {
    id: 'ac_4',
    actor: 'Compliance',
    action: 'approved business verification',
    detail: 'Acme Retail LLC',
    at: ago(26 * HOUR),
    kind: 'verification',
  },
  {
    id: 'ac_5',
    actor: 'System',
    action: 'charged voice usage',
    detail: '$284.61',
    at: ago(4 * HOUR),
    kind: 'billing',
  },
  {
    id: 'ac_6',
    actor: 'Nour Abdelrahman',
    action: 'invited Omar Tarek',
    detail: 'Viewer',
    at: ago(6 * DAY),
    kind: 'team',
  },
]

/** Daily series for the last N days — spend (USD) and minutes. */
export function seedSeries(days = 30) {
  const r = mulberry(4242)
  return range(days).map((i) => {
    const date = new Date(now - (days - 1 - i) * DAY)
    const weekday = date.getDay()
    const weekendDip = weekday === 5 || weekday === 6 ? 0.55 : 1
    const growth = 1 + i * 0.012
    const noise = 0.82 + r() * 0.36
    const minutes = Math.round(620 * weekendDip * growth * noise)
    const calls = Math.round(minutes * (1.9 + r() * 0.5))
    return {
      date: date.toISOString(),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minutes,
      calls,
      messages: Math.round(120 * weekendDip * growth * (0.7 + r() * 0.7)),
      spend: Math.round(minutes * 0.0231 * 100) / 100,
      apiRequests: Math.round(minutes * 31 * (0.9 + r() * 0.3)),
    }
  })
}

/**
 * One shared 90-day series for the whole app. Every page slices from this so
 * "spend this month" reads the same on the dashboard, billing and analytics.
 */
let cachedSeries: ReturnType<typeof seedSeries> | null = null

export function usageSeries(days = 90) {
  cachedSeries ??= seedSeries(90)
  return days >= 90 ? cachedSeries : cachedSeries.slice(-days)
}

/** Month-to-date totals, derived from the same shared series. */
export function monthToDate() {
  const all = usageSeries(90)
  const dayOfMonth = new Date().getDate()
  const window = all.slice(-dayOfMonth)
  return {
    days: window.length,
    spend: window.reduce((sum, d) => sum + d.spend, 0),
    minutes: window.reduce((sum, d) => sum + d.minutes, 0),
    calls: window.reduce((sum, d) => sum + d.calls, 0),
    messages: window.reduce((sum, d) => sum + d.messages, 0),
  }
}

/** Concurrent-call sparkline over the last 24 hours. */
export function seedConcurrency() {
  const r = mulberry(777)
  return range(48).map((i) => {
    const hour = (new Date(now).getHours() - 24 + i / 2 + 24) % 24
    const business = Math.exp(-Math.pow((hour - 13.5) / 5.2, 2))
    return {
      at: new Date(now - (48 - i) * 30 * 60_000).toISOString(),
      value: Math.round(14 + business * 210 * (0.86 + r() * 0.28)),
    }
  })
}
