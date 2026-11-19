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
  { city: 'Casablanca', code: 'CMN', airport: 'Mohammed V International Airport', country: 'Morocco' },
  // Additional worldwide scheduled-service hubs
  { city: 'London City', code: 'LCY', airport: 'London City Airport', country: 'United Kingdom' },
  { city: 'London Luton', code: 'LTN', airport: 'London Luton Airport', country: 'United Kingdom' },
  { city: 'London Stansted', code: 'STN', airport: 'London Stansted Airport', country: 'United Kingdom' },
  { city: 'Doha Hamad', code: 'DOH', airport: 'Hamad International Airport', country: 'Qatar' },
  { city: 'Dubai Al Maktoum', code: 'DWC', airport: 'Al Maktoum International Airport', country: 'United Arab Emirates' },
  { city: 'New York LaGuardia', code: 'LGA', airport: 'LaGuardia Airport', country: 'United States' },
  { city: 'San Francisco', code: 'SFO', airport: 'San Francisco International Airport', country: 'United States' },
  { city: 'Miami', code: 'MIA', airport: 'Miami International Airport', country: 'United States' },
  { city: 'Dallas Fort Worth', code: 'DFW', airport: 'Dallas Fort Worth International Airport', country: 'United States' },
  { city: 'Atlanta', code: 'ATL', airport: 'Hartsfield-Jackson Atlanta International Airport', country: 'United States' },
  { city: 'Boston', code: 'BOS', airport: 'Boston Logan International Airport', country: 'United States' },
  { city: 'Seattle', code: 'SEA', airport: 'Seattle-Tacoma International Airport', country: 'United States' },
  { city: 'Orlando', code: 'MCO', airport: 'Orlando International Airport', country: 'United States' },
  { city: 'Calgary', code: 'YYC', airport: 'Calgary International Airport', country: 'Canada' },
  { city: 'Edmonton', code: 'YEG', airport: 'Edmonton International Airport', country: 'Canada' },
  { city: 'Geneva', code: 'GVA', airport: 'Geneva Airport', country: 'Switzerland' },
  { city: 'Brussels', code: 'BRU', airport: 'Brussels Airport', country: 'Belgium' },
  { city: 'Copenhagen', code: 'CPH', airport: 'Copenhagen Airport', country: 'Denmark' },
  { city: 'Stockholm', code: 'ARN', airport: 'Stockholm Arlanda Airport', country: 'Sweden' },
  { city: 'Oslo', code: 'OSL', airport: 'Oslo Airport', country: 'Norway' },
  { city: 'Lisbon', code: 'LIS', airport: 'Humberto Delgado Airport', country: 'Portugal' },
  { city: 'Athens', code: 'ATH', airport: 'Athens International Airport', country: 'Greece' },
  { city: 'Jeddah', code: 'JED', airport: 'King Abdulaziz International Airport', country: 'Saudi Arabia' },
  { city: 'Abu Dhabi', code: 'AUH', airport: 'Zayed International Airport', country: 'United Arab Emirates' },
  { city: 'Sharjah', code: 'SHJ', airport: 'Sharjah International Airport', country: 'United Arab Emirates' },
  { city: 'Riyadh', code: 'RUH', airport: 'King Khalid International Airport', country: 'Saudi Arabia' },
  { city: 'Dammam', code: 'DMM', airport: 'King Fahd International Airport', country: 'Saudi Arabia' },
  { city: 'Osaka Kansai', code: 'KIX', airport: 'Kansai International Airport', country: 'Japan' },
  { city: 'Taipei', code: 'TPE', airport: 'Taiwan Taoyuan International Airport', country: 'Taiwan' },
  { city: 'Manila', code: 'MNL', airport: 'Ninoy Aquino International Airport', country: 'Philippines' },
  { city: 'Jakarta', code: 'CGK', airport: 'Soekarno-Hatta International Airport', country: 'Indonesia' },
  { city: 'Ho Chi Minh City', code: 'SGN', airport: 'Tan Son Nhat International Airport', country: 'Vietnam' },
  { city: 'Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport', country: 'India' },
  { city: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj International Airport', country: 'India' },
  { city: 'Addis Ababa', code: 'ADD', airport: 'Bole International Airport', country: 'Ethiopia' },
  { city: 'Nairobi', code: 'NBO', airport: 'Jomo Kenyatta International Airport', country: 'Kenya' },
  { city: 'Doha', code: 'DOH', airport: 'Hamad International Airport', country: 'Qatar' },
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
  airline?: string
  airlineCode?: string
  stopsCount?: number
  cabinClass?: string
  departureMinutes?: number
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

type FlightCarrier = { name: string; code: string; domestic?: boolean; hubs: string[] }
const FLIGHT_CARRIERS: FlightCarrier[] = [
  {name:'Pakistan International Airlines',code:'PK',domestic:true,hubs:['ISB','LHE','KHI','PEW','UET','MUX','LYP','SKT','KDU','GIL','GWD','RYK','BHV']},
  {name:'Airblue',code:'PA',domestic:true,hubs:['ISB','LHE','KHI','PEW','SKT']},
  {name:'SereneAir',code:'ER',domestic:true,hubs:['ISB','LHE','KHI','PEW','UET','MUX']},
  {name:'Fly Jinnah',code:'9P',domestic:true,hubs:['KHI','LHE','ISB','PEW','QUETTA']},
  {name:'AirSial',code:'PF',domestic:true,hubs:['KHI','LHE','ISB','Sialkot']},
  {name:'Emirates',code:'EK',hubs:['DXB']},{name:'Qatar Airways',code:'QR',hubs:['DOH']},{name:'Etihad Airways',code:'EY',hubs:['AUH']},
  {name:'Saudia',code:'SV',hubs:['JED','RUH','MED']},{name:'Flynas',code:'XY',hubs:['RUH','JED','DMM']},{name:'Flyadeal',code:'F3',hubs:['RUH','JED','DMM']},
  {name:'flydubai',code:'FZ',hubs:['DXB']},{name:'Air Arabia',code:'G9',hubs:['SHJ','AUH']},{name:'Turkish Airlines',code:'TK',hubs:['IST']},
  {name:'Pegasus Airlines',code:'PC',hubs:['SAW']},{name:'British Airways',code:'BA',hubs:['LHR','LGW']},{name:'Virgin Atlantic',code:'VS',hubs:['LHR']},
  {name:'Lufthansa',code:'LH',hubs:['FRA','MUC']},{name:'SWISS',code:'LX',hubs:['ZRH','GVA']},{name:'Air France',code:'AF',hubs:['CDG']},
  {name:'KLM',code:'KL',hubs:['AMS']},{name:'Iberia',code:'IB',hubs:['MAD','BCN']},{name:'Air Canada',code:'AC',hubs:['YYZ','YVR','YUL']},
  {name:'United Airlines',code:'UA',hubs:['EWR','IAD','ORD','LAX','SFO']},{name:'Delta Air Lines',code:'DL',hubs:['ATL','JFK','LAX']},
  {name:'American Airlines',code:'AA',hubs:['DFW','JFK','ORD','LAX']},{name:'Singapore Airlines',code:'SQ',hubs:['SIN']},
  {name:'Malaysia Airlines',code:'MH',hubs:['KUL']},{name:'Thai Airways',code:'TG',hubs:['BKK']},{name:'Cathay Pacific',code:'CX',hubs:['HKG']},
  {name:'ANA',code:'NH',hubs:['HND','NRT']},{name:'Japan Airlines',code:'JL',hubs:['HND','NRT']},{name:'Gulf Air',code:'GF',hubs:['BAH']},
  {name:'Oman Air',code:'WY',hubs:['MCT']},{name:'Kuwait Airways',code:'KU',hubs:['KWI']},{name:'Azerbaijan Airlines',code:'J2',hubs:['GYD']},
  {name:'EgyptAir',code:'MS',hubs:['CAI']},{name:'Ethiopian Airlines',code:'ET',hubs:['ADD']},{name:'Qantas',code:'QF',hubs:['SYD','MEL']},
]
function airportCode(value: string): string { const explicit=value.match(/\(([A-Z]{3})\)/i)?.[1]?.toUpperCase(); if(explicit)return explicit; const normalized=value.toLowerCase(); return PLACES.find(place=>place.code && (normalized.includes(place.city.toLowerCase()) || normalized.includes(place.airport?.toLowerCase() ?? '___no_airport___')))?.code ?? '' }
function generateFlightOptions(query: SearchQuery): Deal[] {
  const from = airportCode(query.from), to = airportCode(query.to)
  const domestic = !!from && !!to && ['LHE','ISB','KHI','PEW','UET','MUX','LYP','SKT','KDU','GIL','GWD','RYK','BHV'].includes(from) && ['LHE','ISB','KHI','PEW','UET','MUX','LYP','SKT','KDU','GIL','GWD','RYK','BHV'].includes(to)
  const availableCarriers = domestic ? FLIGHT_CARRIERS.filter(c=>c.domestic) : FLIGHT_CARRIERS.filter(c=>!c.domestic)
  // Prefer carriers whose operating hubs match either end of this route, then retain global alternatives.
  const carriers = [...availableCarriers].sort((a,b)=>Number(b.hubs.includes(from)||b.hubs.includes(to))-Number(a.hubs.includes(from)||a.hubs.includes(to)))
  const seed = hash([query.from,query.to,query.out,query.back,query.pax].join('|'))
  const rand = seeded(seed)
  const cabin = /first/i.test(query.pax)?'First':/business/i.test(query.pax)?'Business':'Economy'
  const routeFactor = domestic ? 0.48 : 1 + ((from.charCodeAt(0)||70)+(to.charCodeAt(0)||84))%35/100
  const options: Deal[] = []
  const target = domestic ? 45 : 45
  for(let i=0;i<target;i++) {
    const carrier = carriers[i % carriers.length]
    const variant = Math.floor(i/carriers.length)
    const stopsCount = domestic ? (variant===0 && rand()>.55 ? 1 : 0) : (i%7===0?0:i%4===0?2:1)
    const departureMinutes = (5*60 + Math.floor(rand()*17*60))
    const durationMinutes = Math.round((domestic ? 65+rand()*160 : 250+rand()*650 + stopsCount*115)/5)*5
    const cabinFactor = cabin==='First'?3.8:cabin==='Business'?2.25:1
    const price = Math.max(35,Math.round((domestic?55+rand()*115:240+rand()*650)*routeFactor*cabinFactor*(1+variant*.045)/5)*5)
    const title = `${carrier.name} | ${carrier.code} | ${cabin}`
    const flightNo = `${carrier.code}${100+Math.floor(rand()*890)}`
    const stopLabel = stopsCount===0?'Non-stop':stopsCount===1?'1 stop':'2 stops'
    const timeLabel = `${String(Math.floor(departureMinutes/60)).padStart(2,'0')}:${String(departureMinutes%60).padStart(2,'0')}`
    options.push({id:`flight-${carrier.code}-${i}`,providerId:'aviasales',price,wasPrice:Math.round(price*1.16),priceUnit:'per traveller',stars:0,score:Math.round((7.2+rand()*2.5)*10)/10,reviews:0,freeCancellation:false,direct:stopsCount===0,durationMinutes,title,subtitle:`${flightNo} · ${stopLabel} · ${durationLabel(durationMinutes)} · Departs ${timeLabel}`,perks:[cabin==='Economy'?'Cabin baggage subject to fare':'Premium cabin · subject to availability',domestic?'Pakistan domestic route':'Illustrative international route'],badges:[],affiliateUrl:buildAffiliateUrl('flights',0),airline:carrier.name,airlineCode:carrier.code,stopsCount,cabinClass:cabin,departureMinutes})
  }
  // Add limited alternate-cabin examples so every cabin filter is usable.
  for(const cabinOption of [{name:'Business',factor:2.15},{name:'First',factor:3.8}]) for(let i=0;i<3;i++){const base=options[i];options.push({...base,id:`${base.id}-${cabinOption.name.toLowerCase()}`,title:`${base.airline} | ${base.airlineCode} | ${cabinOption.name}`,cabinClass:cabinOption.name,price:Math.round(base.price*cabinOption.factor),wasPrice:Math.round(base.price*cabinOption.factor*1.15),subtitle:`${cabinOption.name} · ${base.subtitle}`})}
  const cheapest=options.reduce((a,b)=>b.price<a.price?b:a);cheapest.badges.push('Cheapest')
  return options
}

export function dealsFor(query: SearchQuery): Deal[] {
  if (query.type === 'flights') return generateFlightOptions(query)
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

