import type { CountryMeta } from '../types'

export const COUNTRIES: CountryMeta[] = [
  {
    code: 'EG',
    name: 'Egypt',
    dial: '+20',
    flag: '🇪🇬',
    live: true,
    regulated: true,
    note: 'NTRA requires a verified business entity for national and toll-free ranges.',
    regions: [
      { name: 'Cairo', areaCode: '2', cities: ['Cairo', 'Nasr City', 'Maadi', 'New Cairo', 'Heliopolis'] },
      { name: 'Alexandria', areaCode: '3', cities: ['Alexandria', 'Borg El Arab'] },
      { name: 'Giza', areaCode: '2', cities: ['Giza', '6th of October', 'Sheikh Zayed'] },
      { name: 'Red Sea', areaCode: '65', cities: ['Hurghada', 'El Gouna', 'Safaga'] },
      { name: 'South Sinai', areaCode: '69', cities: ['Sharm El Sheikh', 'Dahab'] },
      { name: 'Luxor', areaCode: '95', cities: ['Luxor'] },
      { name: 'Aswan', areaCode: '97', cities: ['Aswan'] },
      { name: 'Port Said', areaCode: '66', cities: ['Port Said'] },
    ],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dial: '+971',
    flag: '🇦🇪',
    live: true,
    regulated: true,
    note: 'TDRA requires a trade licence on file before provisioning.',
    regions: [
      { name: 'Dubai', areaCode: '4', cities: ['Dubai', 'Deira', 'Jumeirah'] },
      { name: 'Abu Dhabi', areaCode: '2', cities: ['Abu Dhabi', 'Al Ain'] },
      { name: 'Sharjah', areaCode: '6', cities: ['Sharjah'] },
    ],
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    dial: '+966',
    flag: '🇸🇦',
    live: true,
    regulated: true,
    regions: [
      { name: 'Riyadh', areaCode: '11', cities: ['Riyadh'] },
      { name: 'Makkah', areaCode: '12', cities: ['Jeddah', 'Makkah', 'Taif'] },
      { name: 'Eastern Province', areaCode: '13', cities: ['Dammam', 'Khobar'] },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    dial: '+1',
    flag: '🇺🇸',
    live: true,
    regulated: false,
    regions: [
      { name: 'New York', areaCode: '212', cities: ['New York', 'Brooklyn'] },
      { name: 'California', areaCode: '415', cities: ['San Francisco', 'Oakland', 'Los Angeles'] },
      { name: 'Texas', areaCode: '512', cities: ['Austin', 'Dallas', 'Houston'] },
      { name: 'Illinois', areaCode: '312', cities: ['Chicago'] },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dial: '+44',
    flag: '🇬🇧',
    live: true,
    regulated: true,
    regions: [
      { name: 'Greater London', areaCode: '20', cities: ['London'] },
      { name: 'Manchester', areaCode: '161', cities: ['Manchester'] },
      { name: 'Edinburgh', areaCode: '131', cities: ['Edinburgh'] },
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    dial: '+49',
    flag: '🇩🇪',
    live: true,
    regulated: true,
    note: 'Bundesnetzagentur requires a local address for geographic numbers.',
    regions: [
      { name: 'Berlin', areaCode: '30', cities: ['Berlin'] },
      { name: 'Bavaria', areaCode: '89', cities: ['Munich'] },
      { name: 'Hesse', areaCode: '69', cities: ['Frankfurt'] },
    ],
  },
  {
    code: 'KE',
    name: 'Kenya',
    dial: '+254',
    flag: '🇰🇪',
    live: false,
    regulated: true,
    note: 'Coming Q4 — join the waitlist for early access.',
    regions: [{ name: 'Nairobi', areaCode: '20', cities: ['Nairobi'] }],
  },
  {
    code: 'NG',
    name: 'Nigeria',
    dial: '+234',
    flag: '🇳🇬',
    live: false,
    regulated: true,
    note: 'Coming Q4 — join the waitlist for early access.',
    regions: [{ name: 'Lagos', areaCode: '1', cities: ['Lagos'] }],
  },
  {
    code: 'MA',
    name: 'Morocco',
    dial: '+212',
    flag: '🇲🇦',
    live: false,
    regulated: true,
    note: 'In regulatory review.',
    regions: [{ name: 'Casablanca-Settat', areaCode: '522', cities: ['Casablanca'] }],
  },
]

export const countryByCode = (code: string) => COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0]

export const NUMBER_TYPE_META = {
  local: {
    label: 'Local',
    blurb: 'A geographic number tied to a city. Best for local presence and inbound support.',
  },
  mobile: {
    label: 'Mobile',
    blurb: 'Reachable for SMS and voice on mobile ranges. Highest deliverability for A2P messaging.',
  },
  national: {
    label: 'National',
    blurb: 'One number for the whole country. No city ties, premium recall.',
  },
  tollfree: {
    label: 'Toll-free',
    blurb: 'Free for the caller, billed to you. The default for national customer service lines.',
  },
} as const

export const CAPABILITY_META = {
  voice: { label: 'Voice', short: 'V' },
  sms: { label: 'SMS', short: 'S' },
  mms: { label: 'MMS', short: 'M' },
  fax: { label: 'Fax', short: 'F' },
} as const

export const TIMEZONES = [
  'Africa/Cairo',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
]

export const USE_CASES = [
  { id: 'ai-voice', label: 'AI Voice Agent', blurb: 'Low-latency media streams and barge-in.' },
  { id: 'contact-center', label: 'Contact Center', blurb: 'Queues, routing and agent seats.' },
  { id: 'sip-trunk', label: 'SIP Trunk', blurb: 'Bring your own PBX or softswitch.' },
  { id: 'call-center', label: 'Outbound Calling', blurb: 'High-volume dialing with CNAM.' },
  { id: 'sms', label: 'SMS Platform', blurb: 'A2P messaging at scale.' },
  { id: 'crm', label: 'CRM Integration', blurb: 'Click-to-call and screen pops.' },
  { id: 'pbx', label: 'Cloud PBX', blurb: 'Extensions, IVR and voicemail.' },
  { id: 'api', label: 'Building on the API', blurb: 'Programmatic voice from scratch.' },
  { id: 'other', label: 'Something else', blurb: "Tell us later — we'll keep it simple." },
]
