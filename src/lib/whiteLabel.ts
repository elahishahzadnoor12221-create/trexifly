// Deep link into the Trexifly White Label flight search (flights.trexifly.com).
// Format (Travelpayouts help article "Links to the White Label with a completed search form"):
//   ?flightSearch=<ORIGIN><DDMM><DESTINATION>[<DDMM return>][<cabin letter>]<adults>[<children>][<infants>]
// Cabin letters: economy = none, comfort = w, business = c, first = f. IATA codes must be upper case.
export const WHITE_LABEL_FLIGHTS_URL = 'https://flights.trexifly.com/'

export type WhiteLabelCabin = 'economy' | 'comfort' | 'business' | 'first'

export type WhiteLabelSearch = {
  origin: string
  destination: string
  departDate: string // YYYY-MM-DD
  returnDate?: string // YYYY-MM-DD; omit for one-way
  adults: number
  children?: number
  infants?: number
  cabin?: WhiteLabelCabin
}

const CABIN_LETTER: Record<WhiteLabelCabin, string> = { economy: '', comfort: 'w', business: 'c', first: 'f' }

function ddmm(iso: string): string {
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) throw new Error('Invalid date: ' + iso)
  return match[2] + match[1]
}

function digit(value: number | undefined, min: number): number {
  return Math.min(Math.max(Math.trunc(value ?? 0) || min, min), 9)
}

export function buildWhiteLabelUrl(search: WhiteLabelSearch, base: string = WHITE_LABEL_FLIGHTS_URL): string {
  const origin = search.origin.trim().toUpperCase()
  const destination = search.destination.trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) throw new Error('Valid IATA codes are required')
  const adults = digit(search.adults, 1)
  const children = Math.min(Math.max(Math.trunc(search.children ?? 0), 0), 9)
  const infants = Math.min(Math.max(Math.trunc(search.infants ?? 0), 0), 9)
  const passengers = String(adults) + (children || infants ? String(children) : '') + (infants ? String(infants) : '')
  const code =
    origin + ddmm(search.departDate) + destination + (search.returnDate ? ddmm(search.returnDate) : '') +
    CABIN_LETTER[search.cabin ?? 'economy'] + passengers
  return base + '?flightSearch=' + code
}