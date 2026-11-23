import type { SearchQuery } from './data'

/**
 * Hotellook was discontinued by Travelpayouts on 20 Oct 2025.
 * This catalogue is deterministic DEMO content, not live hotel inventory,
 * verified property data, current rates, or confirmed availability.
 */
export type HotelListing = {
  id: string
  title: string
  stars: 1 | 2 | 3 | 4 | 5 | 7
  price: number
  score: number
  reviews: number
  neighborhood: string
  address: string
  photoUrl: string
  priceUnit: string
  subtitle: string
  perks: string[]
}

const PHOTO_IDS = [
  'photo-1566073771259-6a8506099945', 'photo-1582719508461-905c673771fd',
  'photo-1542314831-068cd1dbfeeb', 'photo-1520250497591-112f2f40a3f4',
  'photo-1551882547-ff40c63fe5fa', 'photo-1571896349842-33c89424de2d',
]
const CITY_DATA: Record<string, { country: string; areas: string[]; factor: number }> = {
  Dubai: { country: 'United Arab Emirates', areas: ['Downtown Dubai', 'Dubai Marina', 'Deira', 'Palm Jumeirah', 'Business Bay', 'Jumeirah'], factor: 1.45 },
  Makkah: { country: 'Saudi Arabia', areas: ['Al Haram', 'Ajyad', 'Al Aziziyah', 'Ibrahim Al Khalil Road', 'Al Misfalah', 'Al Naseem'], factor: 1.12 },
  Madinah: { country: 'Saudi Arabia', areas: ['Central Area', 'Al Haram', 'Qurban', 'Al Aridh', 'Al Iskan', 'King Fahd District'], factor: 1.08 },
  Lahore: { country: 'Pakistan', areas: ['Gulberg', 'DHA', 'Mall Road', 'Johar Town', 'Cantt', 'Model Town'], factor: 0.72 },
  Islamabad: { country: 'Pakistan', areas: ['Blue Area', 'F-6', 'F-7', 'G-5', 'E-11', 'Diplomatic Enclave'], factor: 0.82 },
  London: { country: 'United Kingdom', areas: ['Westminster', 'Covent Garden', 'Kensington', 'Paddington', 'Canary Wharf', 'Bloomsbury'], factor: 1.55 },
  Istanbul: { country: 'Türkiye', areas: ['Sultanahmet', 'Taksim', 'Galata', 'Kadikoy', 'Besiktas', 'Fatih'], factor: 1.02 },
  Toronto: { country: 'Canada', areas: ['Downtown', 'Entertainment District', 'Yorkville', 'North York', 'Harbourfront', 'Old Town'], factor: 1.38 },
  Bangkok: { country: 'Thailand', areas: ['Sukhumvit', 'Silom', 'Siam', 'Riverside', 'Sathorn', 'Pratunam'], factor: 0.88 },
}
const PREFIX = ['City', 'Grand', 'Parkside', 'Central', 'Heritage', 'Garden', 'Metro', 'Royal', 'Urban', 'Signature', 'Premier', 'Vista']
const SUFFIX: Record<number, string[]> = {
  1: ['Lodge', 'Inn', 'Guest House', 'Budget Rooms'],
  2: ['Comfort Hotel', 'Residency', 'City Stay', 'Express Suites'],
  3: ['Hotel', 'Boutique Hotel', 'Business Hotel', 'Central Suites'],
  4: ['Hotel & Suites', 'Executive Hotel', 'Grand Residence', 'Boutique Suites'],
  5: ['Luxury Hotel', 'Palace Hotel', 'Grand Resort', 'Signature Suites'],
  7: ['Iconic Ultra-Luxury Collection'],
}
const PRICE_BASE: Record<number, number> = { 1: 24, 2: 38, 3: 65, 4: 115, 5: 220, 7: 950 }

function hash(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) h = Math.imul(h ^ value.charCodeAt(i), 16777619)
  return h >>> 0
}
function rng(seed: number): () => number {
  let state = seed || 1
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296 }
}
function nightsBetween(checkIn: string, checkOut: string): number {
  const a = Date.parse(checkIn), b = Date.parse(checkOut)
  return Number.isFinite(a) && Number.isFinite(b) && b > a ? Math.max(1, Math.round((b - a) / 86400000)) : 1
}
function adultCount(pax: string): number {
  const n = Number(pax.match(/\d+/)?.[0] ?? 2)
  return Math.max(1, Math.min(8, n))
}

export function generateHotelInventory(query: SearchQuery): HotelListing[] {
  const city = query.to.trim().split(',')[0].replace(/\s*\([^)]*\)\s*$/, '') || 'Dubai'
  const destinationCountry = query.to.split(',').slice(1).join(',').trim() || 'International destination'
  const profile = CITY_DATA[city] ?? { country: destinationCountry, areas: ['City Centre', 'Historic District', 'Business District', 'Riverside', 'Shopping District', 'Airport District'], factor: 1 }
  const random = rng(hash([city, query.out, query.back, query.pax].join('|')))
  const nights = nightsBetween(query.out, query.back)
  const adults = adultCount(query.pax)
  const tiers: Array<1 | 2 | 3 | 4 | 5 | 7> = city.toLowerCase() === 'dubai' ? [1, 2, 3, 4, 5, 7] : [1, 2, 3, 4, 5]
  const hotels: HotelListing[] = []

  for (const stars of tiers) {
    const count = stars === 7 ? 6 : 12
    for (let i = 0; i < count; i += 1) {
      const area = profile.areas[i % profile.areas.length]
      const prefix = PREFIX[(i + stars * 2) % PREFIX.length]
      const suffixes = SUFFIX[stars]
      const suffix = suffixes[(i + stars) % suffixes.length]
      const iconic = stars === 7 && city.toLowerCase() === 'dubai' && i === 0
      const title = iconic ? 'Burj Al Arab Jumeirah' : `${prefix} ${area} ${suffix}`
      const perNight = Math.max(18, Math.round(PRICE_BASE[stars] * profile.factor * (0.82 + random() * 0.42)))
      const rating = Math.round((6.7 + random() * 3.1) * 10) / 10
      const photo = PHOTO_IDS[Math.floor(random() * PHOTO_IDS.length)]
      hotels.push({
        id: `demo-${hash(`${city}-${stars}-${i}`).toString(16)}`,
        title,
        stars,
        price: perNight * nights,
        score: rating,
        reviews: 35 + Math.floor(random() * 4200),
        neighborhood: area,
        address: `${area}, ${city}, ${profile.country}`,
        photoUrl: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=800&q=85`,
        priceUnit: `estimated total for ${nights} night${nights === 1 ? '' : 's'} · ${adults} adult${adults === 1 ? '' : 's'}`,
        subtitle: `${stars === 7 ? 'Iconic ultra-luxury stay' : `${stars}-star stay`} · ${area}`,
        perks: ['Property details on partner site', 'Availability varies by dates'],
      })
    }
  }
  return hotels
}
