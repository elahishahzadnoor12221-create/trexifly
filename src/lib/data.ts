import { buildAffiliateUrl } from './affiliates'

export type TripType = 'flights' | 'hotels' | 'cars' | 'tours'

export const TRIP_TYPES: TripType[] = ['flights', 'hotels', 'cars', 'tours']

export const TRIP_NOUN: Record<TripType, string> = {
  flights: 'Flights',
  hotels: 'Stays',
  cars: 'Car rentals',
  tours: 'Tours',
}

export type SearchQuery = {
  type: TripType
  from: string
  to: string
  out: string
  back: string
  pax: string
  vehicle: string
  duration: string
  pkg: string
}

export type Place = { city: string; code?: string; airport?: string; country: string }

export const PLACES: Place[] = [
  // Pakistan Airports
  { city: 'Lahore', code: 'LHE', airport: 'Allama Iqbal International Airport', country: 'Pakistan' },
  { city: 'Islamabad', code: 'ISB', airport: 'Islamabad International Airport', country: 'Pakistan' },
  { city: 'Karachi', code: 'KHI', airport: 'Jinnah International Airport', country: 'Pakistan' },
  { city: 'Peshawar', code: 'PEW', airport: 'Bacha Khan International Airport', country: 'Pakistan' },
  { city: 'Sialkot', code: 'SKT', airport: 'Sialkot International Airport', country: 'Pakistan' },
  { city: 'Multan', code: 'MUX', airport: 'Multan International Airport', country: 'Pakistan' },
  { city: 'Faisalabad', code: 'LYP', airport: 'Faisalabad International Airport', country: 'Pakistan' },
  { city: 'Quetta', code: 'UET', airport: 'Quetta International Airport', country: 'Pakistan' },
  { city: 'Skardu', code: 'KDU', airport: 'Skardu International Airport', country: 'Pakistan' },
  { city: 'Gilgit', code: 'GIL', airport: 'Gilgit Airport', country: 'Pakistan' },
  { city: 'Gwadar', code: 'GWD', airport: 'New Gwadar International Airport', country: 'Pakistan' },
  { city: 'Bahawalpur', code: 'BHV', airport: 'Bahawalpur Airport', country: 'Pakistan' },
  { city: 'Sukkur', code: 'SKZ', airport: 'Begum Nusrat Bhutto Airport', country: 'Pakistan' },
  { city: 'Rahim Yar Khan', code: 'RYK', airport: 'Shaikh Zayed International Airport', country: 'Pakistan' },
  { city: 'Dera Ghazi Khan', code: 'DEA', airport: 'Dera Ghazi Khan International Airport', country: 'Pakistan' },
  { city: 'Hunza', country: 'Pakistan' },
  { city: 'Swat', country: 'Pakistan' },

  // UAE, Saudi Arabia & Middle East
  { city: 'Dubai', code: 'DXB', airport: 'Dubai International Airport', country: 'United Arab Emirates' },
  { city: 'Abu Dhabi', code: 'AUH', airport: 'Zayed International Airport', country: 'United Arab Emirates' },
  { city: 'Sharjah', code: 'SHJ', airport: 'Sharjah International Airport', country: 'United Arab Emirates' },
  { city: 'Jeddah', code: 'JED', airport: 'King Abdulaziz International Airport', country: 'Saudi Arabia' },
  { city: 'Madinah', code: 'MED', airport: 'Prince Mohammad Bin Abdulaziz Airport', country: 'Saudi Arabia' },
  { city: 'Riyadh', code: 'RUH', airport: 'King Khalid International Airport', country: 'Saudi Arabia' },
  { city: 'Dammam', code: 'DMM', airport: 'King Fahd International Airport', country: 'Saudi Arabia' },
  { city: 'Doha', code: 'DOH', airport: 'Hamad International Airport', country: 'Qatar' },
  { city: 'Muscat', code: 'MCT', airport: 'Muscat International Airport', country: 'Oman' },
  { city: 'Kuwait City', code: 'KWI', airport: 'Kuwait International Airport', country: 'Kuwait' },
  { city: 'Bahrain', code: 'BAH', airport: 'Bahrain International Airport', country: 'Bahrain' },
  { city: 'Amman', code: 'AMM', airport: 'Queen Alia International Airport', country: 'Jordan' },

  // Turkey, Caucasus & Central Asia
  { city: 'Istanbul', code: 'IST', airport: 'Istanbul Airport', country: 'Turkey' },
  { city: 'Istanbul Sabiha', code: 'SAW', airport: 'Sabiha Gokcen International Airport', country: 'Turkey' },
  { city: 'Antalya', code: 'AYT', airport: 'Antalya Airport', country: 'Turkey' },
  { city: 'Baku', code: 'GYD', airport: 'Heydar Aliyev International Airport', country: 'Azerbaijan' },
  { city: 'Tashkent', code: 'TAS', airport: 'Islam Karimov Tashkent Airport', country: 'Uzbekistan' },
  { city: 'Almaty', code: 'ALA', airport: 'Almaty International Airport', country: 'Kazakhstan' },

  // UK & Europe
  { city: 'London Heathrow', code: 'LHR', airport: 'Heathrow Airport', country: 'United Kingdom' },
  { city: 'London Gatwick', code: 'LGW', airport: 'Gatwick Airport', country: 'United Kingdom' },
  { city: 'Manchester', code: 'MAN', airport: 'Manchester Airport', country: 'United Kingdom' },
  { city: 'Birmingham', code: 'BHX', airport: 'Birmingham Airport', country: 'United Kingdom' },
  { city: 'Paris', code: 'CDG', airport: 'Charles de Gaulle Airport', country: 'France' },
  { city: 'Madrid', code: 'MAD', airport: 'Adolfo Suarez Madrid-Barajas Airport', country: 'Spain' },
  { city: 'Barcelona', code: 'BCN', airport: 'Josep Tarradellas Barcelona-El Prat Airport', country: 'Spain' },
  { city: 'Frankfurt', code: 'FRA', airport: 'Frankfurt Airport', country: 'Germany' },
  { city: 'Munich', code: 'MUC', airport: 'Munich Airport', country: 'Germany' },
  { city: 'Rome', code: 'FCO', airport: 'Leonardo da Vinci Fiumicino Airport', country: 'Italy' },
  { city: 'Milan', code: 'MXP', airport: 'Milan Malpensa Airport', country: 'Italy' },
  { city: 'Amsterdam', code: 'AMS', airport: 'Amsterdam Airport Schiphol', country: 'Netherlands' },
  { city: 'Zurich', code: 'ZRH', airport: 'Zurich Airport', country: 'Switzerland' },
  { city: 'Vienna', code: 'VIE', airport: 'Vienna International Airport', country: 'Austria' },

  // USA & Canada
  { city: 'New York', code: 'JFK', airport: 'John F. Kennedy International Airport', country: 'United States' },
  { city: 'Newark', code: 'EWR', airport: 'Newark Liberty International Airport', country: 'United States' },
  { city: 'Los Angeles', code: 'LAX', airport: 'Los Angeles International Airport', country: 'United States' },
  { city: 'Chicago', code: 'ORD', airport: "O'Hare International Airport", country: 'United States' },
  { city: 'Washington Dulles', code: 'IAD', airport: 'Dulles International Airport', country: 'United States' },
  { city: 'Houston', code: 'IAH', airport: 'George Bush Intercontinental Airport', country: 'United States' },
  { city: 'Toronto', code: 'YYZ', airport: 'Toronto Pearson International Airport', country: 'Canada' },
  { city: 'Vancouver', code: 'YVR', airport: 'Vancouver International Airport', country: 'Canada' },
  { city: 'Montreal', code: 'YUL', airport: 'Montreal-Trudeau International Airport', country: 'Canada' },

  // Asia-Pacific & Oceania
  { city: 'Tokyo Haneda', code: 'HND', airport: 'Haneda Airport', country: 'Japan' },
  { city: 'Tokyo Narita', code: 'NRT', airport: 'Narita International Airport', country: 'Japan' },
  { city: 'Singapore', code: 'SIN', airport: 'Singapore Changi Airport', country: 'Singapore' },
  { city: 'Kuala Lumpur', code: 'KUL', airport: 'Kuala Lumpur International Airport', country: 'Malaysia' },
  { city: 'Bangkok', code: 'BKK', airport: 'Suvarnabhumi Airport', country: 'Thailand' },
  { city: 'Seoul', code: 'ICN', airport: 'Incheon International Airport', country: 'South Korea' },
  { city: 'Hong Kong', code: 'HKG', airport: 'Hong Kong International Airport', country: 'Hong Kong' },
  { city: 'Beijing', code: 'PEK', airport: 'Beijing Capital International Airport', country: 'China' },
  { city: 'Guangzhou', code: 'CAN', airport: 'Guangzhou Baiyun International Airport', country: 'China' },
  { city: 'Male', code: 'MLE', airport: 'Velana International Airport', country: 'Maldives' },
  { city: 'Colombo', code: 'CMB', airport: 'Bandaranaike International Airport', country: 'Sri Lanka' },
  { city: 'Sydney', code: 'SYD', airport: 'Sydney Kingsford Smith Airport', country: 'Australia' },
  { city: 'Melbourne', code: 'MEL', airport: 'Melbourne Airport', country: 'Australia' },

  // Africa
  { city: 'Cairo', code: 'CAI', airport: 'Cairo International Airport', country: 'Egypt' },
  { city: 'Johannesburg', code: 'JNB', airport: 'O.R. Tambo International Airport', country: 'South Africa' },
  { city: 'Cape Town', code: 'CPT', airport: 'Cape Town International Airport', country: 'South Africa' },
  { city: 'Casablanca', code: 'CMN', airport: 'Mohammed V International Airport', country: 'Morocco' }
]

export const AIRPORT_OPTIONS = PLACES.map((place) => ({
  value: place.code ? `${place.city} (${place.code})` : place.city,
  label: place.code ? `${place.city} (${place.code}) · ${place.country}` : `${place.city} · ${place.country}`,
}))

export const HOTEL_CITIES = ['Dubai', 'Istanbul', 'London', 'Hunza', 'Skardu', 'Islamabad']

export const CAR_LOCATIONS = [
  'Dubai — Downtown',
  'Istanbul — IST Airport',
  'London — Heathrow',
  'Islamabad — Blue Area',
  'Skardu — Airport Road',
  'Zurich — Hauptbahnhof',
]

export const TOUR_DESTINATIONS = ['Hunza Valley', 'Skardu & Shangrila', 'Dubai', 'Istanbul', 'Swiss Alps', 'London']

export const VEHICLES = ['Sedan', 'SUV / 4x4', 'Luxury']
export const DURATIONS = ['3-4 days', '5-7 days', '8-12 days']
export const PACKAGES = ['Group', 'Family', 'Private']

export const PAX_OPTIONS = ['1 adult · Economy', '2 adults · Economy', '2 adults · Business', '3 adults · Economy', 'Family of 4 · Economy']
export const GUEST_OPTIONS = ['1 room · 1 guest', '1 room · 2 guests', '2 rooms · 4 guests', 'Family suite · 4 guests']

export type ProviderId = 'booking' | 'agoda' | 'aviasales' | 'trip' | 'kiwi' | 'expedia'

export type Provider = {
  id: ProviderId
  name: string
  mark: string
  color: string
}

export const PROVIDERS: Record<ProviderId, Provider> = {
  booking: { id: 'booking', name: 'Booking.com', mark: 'B', color: '#2b5bff' },
  agoda: { id: 'agoda', name: 'Agoda', mark: 'A', color: '#ff4d6d' },
  aviasales: { id: 'aviasales', name: 'Aviasales', mark: 'Av', color: '#ff8a3d' },
  trip: { id: 'trip', name: 'Trip.com', mark: 'T', color: '#38bdf8' },
  kiwi: { id: 'kiwi', name: 'Kiwi.com', mark: 'K', color: '#00c2a8' },
  expedia: { id: 'expedia', name: 'Expedia', mark: 'E', color: '#ffd166' },
}

export const PARTNERS = Object.values(PROVIDERS)

export type Badge = 'Cheapest' | 'Fastest' | 'Best value'

export type Deal = {
  id: string
  providerId: ProviderId
  price: number
  wasPrice: number
  priceUnit: string
  stars: number
  score: number
  reviews: number
  freeCancellation: boolean
  direct: boolean
  durationMinutes: number
  title: string
  subtitle: string
  perks: string[]
  badges: Badge[]
  affiliateUrl: string
}

/* ------------------------------------------------------------------ dates */

export function isoIn(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function nightsBetween(from: string, to: string): number {
  const start = Date.parse(from)
  const end = Date.parse(to)
  if (Number.isNaN(start) || Number.isNaN(end)) return 3
  return Math.max(1, Math.round((end - start) / 86_400_000))
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ------------------------------------------------------------- fake engine */

const PROVIDERS_BY_TYPE: Record<TripType, ProviderId[]> = {
  flights: ['aviasales', 'trip', 'kiwi', 'booking'],
  hotels: ['booking', 'agoda', 'trip', 'expedia'],
  cars: ['booking', 'expedia', 'trip', 'agoda'],
  tours: ['trip', 'expedia', 'booking', 'agoda'],
}

const PRICE_FACTOR: Record<ProviderId, number> = {
  booking: 1.06,
  agoda: 0.96,
  aviasales: 0.94,
  trip: 1.02,
  kiwi: 1.09,
  expedia: 1.12,
}

const CITY_FACTOR: Record<string, number> = {
  Dubai: 1.34,
  Istanbul: 1.02,
  London: 1.46,
  Hunza: 0.66,
  Skardu: 0.6,
  Islamabad: 0.72,
}

const AIRLINES = ['Emirates', 'PIA', 'flydubai', 'Airblue', 'Gulf Air', 'Etihad', 'Qatar Airways', 'Turkish Airlines', 'Saudia', 'Thai Airways']
const ROOMS = ['Deluxe King Room', 'Sea View Twin', 'Executive Suite', 'Garden Villa', 'Family Studio']
const CARS = ['Toyota Corolla', 'Kia Sportage', 'Hyundai Tucson', 'Range Rover Evoque', 'Mercedes C-Class', 'Toyota Fortuner']

function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Deterministic PRNG so the same search always returns the same offers. */
function seeded(seed: number): () => number {
  let state = seed || 1
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function basePrice(query: SearchQuery, rand: () => number): number {
  switch (query.type) {
    case 'flights':
      return Math.round((255 + rand() * 390) / 5) * 5
    case 'hotels': {
      const factor = CITY_FACTOR[query.to] ?? 1
      return Math.round(((88 + rand() * 155) * factor) / 5) * 5
    }
    case 'cars':
      return Math.round((42 + rand() * 66) / 3) * 3
    case 'tours':
      return Math.round((520 + rand() * 780) / 10) * 10
  }
}

function durationLabel(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`
}

function cabinFrom(pax: string): string {
  const parts = pax.split('·')
  return parts.length > 1 ? parts[1].trim() : 'Economy'
}

function pick<T>(list: T[], rand: () => number): T {
  return list[Math.floor(rand() * list.length) % list.length]
}

export function dealsFor(query: SearchQuery): Deal[] {
  const seed = hash(
    [query.type, query.from, query.to, query.out, query.back, query.pax, query.vehicle, query.duration, query.pkg].join('|'),
  )
  const rand = seeded(seed)
  const providers = PROVIDERS_BY_TYPE[query.type]
  const base = basePrice(query, rand)
  const nights = nightsBetween(query.out, query.back)
  const deals: Deal[] = []

  providers.forEach((providerId, providerIndex) => {
    for (let variant = 0; variant < 2; variant += 1) {
      const jitter = 0.84 + rand() * 0.34
      const price = Math.max(19, Math.round(base * PRICE_FACTOR[providerId] * jitter * (variant ? 1.12 : 1)))
      const stars = 3 + Math.floor(rand() * 3)
      const score = Math.round((7.1 + rand() * 2.5) * 10) / 10
      const reviews = 140 + Math.floor(rand() * 5200)
      const freeCancellation = rand() > 0.32
      const stops = query.type === 'flights' ? (variant === 0 ? (rand() > 0.45 ? 0 : 1) : 1 + Math.floor(rand() * 2)) : 0
      const minutes = 165 + Math.floor(rand() * 55) * 10 + stops * 95

      let title: string
      let subtitle: string
      let priceUnit: string
      let perks: string[]

      switch (query.type) {
        case 'flights':
          title = `${pick(AIRLINES, rand)} · ${cabinFrom(query.pax)}`
          subtitle = `${stops === 0 ? 'Non-stop' : `${stops} stop`} · ${durationLabel(minutes)}`
          priceUnit = 'per traveller'
          perks = stops === 0 ? ['Cabin bag 10 kg', 'Seat selection from $6'] : ['Cabin bag 10 kg', 'Self-transfer protected']
          break
        case 'hotels':
          title = pick(ROOMS, rand)
          subtitle = `${nights} night${nights > 1 ? 's' : ''} · ${query.pax}`
          priceUnit = 'per night'
          perks = freeCancellation ? ['Free cancellation', 'Pay at property'] : ['Free breakfast', 'Pay at property']
          break
        case 'cars':
          title = `${pick(CARS, rand)} or similar`
          subtitle = `${Math.max(1, nights)} day${nights > 1 ? 's' : ''} · ${query.vehicle} · Automatic`
          priceUnit = 'per day'
          perks = ['Unlimited mileage', 'Full insurance included']
          break
        case 'tours':
          title = `${query.duration} ${query.to} ${query.pkg.toLowerCase()} tour`
          subtitle = `${query.pkg} package · ${nights} nights · local guide`
          priceUnit = 'per person'
          perks = ['Hotel pickup', 'All entry fees', 'English-speaking guide']
          break
      }

      deals.push({
        id: `${providerId}-${providerIndex}-${variant}`,
        providerId,
        price,
        wasPrice: Math.round(price * 1.18),
        priceUnit,
        stars,
        score,
        reviews,
        freeCancellation,
        direct: stops === 0,
        durationMinutes: minutes,
        title,
        subtitle,
        perks: perks.slice(0, 2),
        badges: [],
        affiliateUrl: buildAffiliateUrl(query.type, providerIndex),
      })
    }
  })

  const cheapest = deals.reduce((a, b) => (b.price < a.price ? b : a))
  cheapest.badges.push('Cheapest')

  const remaining = deals.filter((deal) => deal.id !== cheapest.id)
  const bestValue = remaining.reduce((a, b) => (b.score / b.price > a.score / a.price ? b : a))
  bestValue.badges.push('Best value')

  if (query.type === 'flights') {
    const fastest = deals.reduce((a, b) => (b.durationMinutes < a.durationMinutes ? b : a))
    if (fastest.badges.length === 0) fastest.badges.push('Fastest')
  }

  return deals
}

export function perProviderBest(deals: Deal[]): Deal[] {
  const best = new Map<ProviderId, Deal>()
  for (const deal of deals) {
    const current = best.get(deal.providerId)
    if (!current || deal.price < current.price) best.set(deal.providerId, deal)
  }
  return [...best.values()].sort((a, b) => a.price - b.price)
}

export type Destination = {
  slug: string
  name: string
  country: string
  blurb: string
  from: number
  rating: number
  tag: string
  art: 'dubai' | 'istanbul' | 'london' | 'hunza' | 'skardu' | 'alps'
  type: TripType
  to: string
}

export const DESTINATIONS: Destination[] = [
  {
    slug: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    blurb: 'Skyline sunsets, desert dunes and duty-free weekends.',
    from: 289,
    rating: 4.9,
    tag: 'Most booked',
    art: 'dubai',
    type: 'hotels',
    to: 'Dubai',
  },
  {
    slug: 'istanbul',
    name: 'Istanbul',
    country: 'Türkiye',
    blurb: 'Bosphorus ferries, spice bazaars and rooftop breakfasts.',
    from: 319,
    rating: 4.8,
    tag: 'Culture pick',
    art: 'istanbul',
    type: 'hotels',
    to: 'Istanbul',
  },
  {
    slug: 'london',
    name: 'London',
    country: 'United Kingdom',
    blurb: 'West End nights, free museums and afternoon tea.',
    from: 398,
    rating: 4.7,
    tag: 'City break',
    art: 'london',
    type: 'hotels',
    to: 'London',
  },
  {
    slug: 'attabad-lake',
    name: 'Attabad Lake, Hunza',
    country: 'Pakistan',
    blurb: 'Turquoise water beneath the Karakoram giants.',
    from: 249,
    rating: 4.9,
    tag: 'Adventure',
    art: 'hunza',
    type: 'tours',
    to: 'Hunza Valley',
  },
  {
    slug: 'shangrila',
    name: 'Shangrila, Skardu',
    country: 'Pakistan',
    blurb: 'Lower Kachura lake, pine forests and cold nights.',
    from: 265,
    rating: 4.8,
    tag: 'Hidden gem',
    art: 'skardu',
    type: 'tours',
    to: 'Skardu & Shangrila',
  },
  {
    slug: 'swiss-alps',
    name: 'Swiss Alps',
    country: 'Switzerland',
    blurb: 'Glacier trains, chalet stays and peak views.',
    from: 545,
    rating: 4.9,
    tag: 'Luxury',
    art: 'alps',
    type: 'hotels',
    to: 'Zurich',
  },
]

/* ------------------------------------------------------------------ query */

export function readQuery(params: URLSearchParams): SearchQuery {
  const requested = params.get('type')
  const type: TripType = TRIP_TYPES.includes(requested as TripType) ? (requested as TripType) : 'flights'
  const fallbackCity = type === 'hotels' || type === 'tours' ? 'Dubai' : type === 'cars' ? CAR_LOCATIONS[0] : 'Dubai (DXB)'
  return {
    type,
    from: params.get('from') ?? 'Islamabad (ISB)',
    to: params.get('to') ?? fallbackCity,
    out: params.get('out') ?? isoIn(21),
    back: params.get('back') ?? isoIn(28),
    pax: params.get('pax') ?? '2 adults · Economy',
    vehicle: params.get('vehicle') ?? VEHICLES[1],
    duration: params.get('duration') ?? DURATIONS[1],
    pkg: params.get('pkg') ?? PACKAGES[1],
  }
}

export function queryTitle(query: SearchQuery): string {
  switch (query.type) {
    case 'flights':
      return `${query.from} → ${query.to}`
    case 'hotels':
      return `Stays in ${query.to}`
    case 'cars':
      return `Car rentals in ${query.from}`
    case 'tours':
      return `${query.to} packages`
  }
}

export function querySubtitle(query: SearchQuery): string {
  if (query.type === 'flights') return `${formatDate(query.out)} — ${formatDate(query.back)} · ${query.pax}`
  if (query.type === 'tours') return `${query.duration} · ${query.pkg} package · ${query.pax}`
  return `${formatDate(query.out)} — ${formatDate(query.back)} · ${query.pax}`
}

