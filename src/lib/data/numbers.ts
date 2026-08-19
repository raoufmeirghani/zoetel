import type { Capability, CarrierId, NumberType, PhoneNumber } from '../types'
import { COUNTRIES, countryByCode } from './countries'
import { hashString, mulberry } from '../utils'

const CARRIERS: CarrierId[] = ['we', 'vodafone', 'etisalat']

export interface NumberQuery {
  country: string
  region?: string
  city?: string
  type?: NumberType | 'any'
  capabilities?: Capability[]
  contains?: string
  maxMonthly?: number
}

const BASE_PRICE: Record<NumberType, Record<string, number>> = {
  local: { EG: 1.1, AE: 3.5, SA: 3.0, US: 0.6, GB: 1.05, DE: 1.4, default: 1.5 },
  mobile: { EG: 2.4, AE: 5.5, SA: 4.8, US: 1.1, GB: 1.6, DE: 3.2, default: 2.8 },
  national: { EG: 4.5, AE: 8.0, SA: 7.5, US: 2.0, GB: 3.0, DE: 5.5, default: 5.0 },
  tollfree: { EG: 9.0, AE: 16.0, SA: 14.0, US: 2.2, GB: 4.5, DE: 8.5, default: 10.0 },
}

const SETUP: Record<NumberType, number> = { local: 0, mobile: 0.5, national: 2, tollfree: 3 }

function priceFor(type: NumberType, country: string, rnd: () => number) {
  const table = BASE_PRICE[type]
  const base = table[country] ?? table.default
  return Math.round((base + (rnd() - 0.35) * base * 0.22) * 100) / 100
}

function capsFor(type: NumberType, rnd: () => number): Capability[] {
  const caps: Capability[] = ['voice']
  if (type === 'mobile') caps.push('sms')
  if (type === 'local' && rnd() > 0.35) caps.push('sms')
  if (type === 'national' && rnd() > 0.6) caps.push('sms')
  if (caps.includes('sms') && rnd() > 0.72) caps.push('mms')
  if (rnd() > 0.82) caps.push('fax')
  return caps
}

function subscriberDigits(rnd: () => number, len: number, contains?: string) {
  let s = ''
  for (let i = 0; i < len; i++) s += Math.floor(rnd() * 10)
  if (contains && /^\d+$/.test(contains) && contains.length < len) {
    const at = Math.floor(rnd() * (len - contains.length))
    s = s.slice(0, at) + contains + s.slice(at + contains.length)
  }
  return s
}

function buildE164(country: string, areaCode: string, type: NumberType, rnd: () => number, contains?: string) {
  const dial = countryByCode(country).dial
  if (type === 'tollfree') {
    if (country === 'EG') return `${dial}800${subscriberDigits(rnd, 7, contains)}`
    if (country === 'US') return `+1833${subscriberDigits(rnd, 7, contains)}`
    if (country === 'GB') return `+44800${subscriberDigits(rnd, 6, contains)}`
    return `${dial}800${subscriberDigits(rnd, 6, contains)}`
  }
  if (type === 'mobile') {
    if (country === 'EG') {
      const prefix = ['10', '11', '12', '15'][Math.floor(rnd() * 4)]
      return `${dial}${prefix}${subscriberDigits(rnd, 8, contains)}`
    }
    if (country === 'AE') return `${dial}5${subscriberDigits(rnd, 8, contains)}`
    if (country === 'SA') return `${dial}5${subscriberDigits(rnd, 8, contains)}`
    if (country === 'GB') return `${dial}7${subscriberDigits(rnd, 9, contains)}`
    if (country === 'DE') return `${dial}15${subscriberDigits(rnd, 9, contains)}`
    return `${dial}${subscriberDigits(rnd, 9, contains)}`
  }
  if (type === 'national') {
    if (country === 'EG') return `${dial}16${subscriberDigits(rnd, 4, contains)}`
    return `${dial}3${subscriberDigits(rnd, 8, contains)}`
  }
  // local / geographic
  const len = country === 'EG' ? 8 : country === 'US' ? 7 : 7
  return `${dial}${areaCode}${subscriberDigits(rnd, len, contains)}`
}

const ALL_TYPES: NumberType[] = ['local', 'mobile', 'national', 'tollfree']

/** Deterministic marketplace inventory for a query — same query, same results. */
export function searchInventory(q: NumberQuery, limit = 60): PhoneNumber[] {
  const country = countryByCode(q.country)
  const seed = hashString(JSON.stringify([q.country, q.region, q.city, q.type, q.contains]))
  const rnd = mulberry(seed || 1)
  const results: PhoneNumber[] = []

  const regions = q.region ? country.regions.filter((r) => r.name === q.region) : country.regions
  const types = !q.type || q.type === 'any' ? ALL_TYPES : [q.type]

  let guard = 0
  while (results.length < limit && guard < limit * 12) {
    guard++
    const region = regions[Math.floor(rnd() * regions.length)] ?? country.regions[0]
    const cities = q.city ? [q.city] : region.cities
    const city = cities[Math.floor(rnd() * cities.length)]
    const type = types[Math.floor(rnd() * types.length)]
    if (type === 'tollfree' && rnd() > 0.35) continue
    if (type === 'national' && rnd() > 0.4) continue

    const e164 = buildE164(country.code, region.areaCode, type, rnd, q.contains)
    if (results.some((r) => r.e164 === e164)) continue
    const capabilities = capsFor(type, rnd)
    if (q.capabilities?.length && !q.capabilities.every((c) => capabilities.includes(c))) continue

    const monthly = priceFor(type, country.code, rnd)
    if (q.maxMonthly != null && monthly > q.maxMonthly) continue

    results.push({
      id: `num_${e164.replace(/\D/g, '')}`,
      e164,
      carrier: CARRIERS[Math.floor(rnd() * CARRIERS.length)],
      country: country.code,
      region: region.name,
      city: type === 'tollfree' || type === 'national' ? 'Nationwide' : city,
      type,
      capabilities,
      monthly,
      setup: SETUP[type],
      availableCount: 1 + Math.floor(rnd() * 40),
      requiresRegulatoryDocs: country.regulated && (type === 'national' || type === 'tollfree' || rnd() > 0.72),
      isNew: rnd() > 0.9,
    })
  }
  return results
}

export const liveCountries = COUNTRIES.filter((c) => c.live)
