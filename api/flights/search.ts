type ApiEnv = { TRAVELPAYOUTS_API_TOKEN?: string; TRAVELPAYOUTS_MARKER_ID?: string; TRAVELPAYOUTS_TRS_ID?: string }
type VercelRequest = { method?: string; query?: Record<string, string | string[] | undefined>; env?: ApiEnv }
type VercelResponse = { setHeader(name: string, value: string): void; status(code: number): VercelResponse; json(body: unknown): VercelResponse }
declare const process: { env: ApiEnv }

type AviasalesFare = {
  origin?: string; destination?: string; origin_airport?: string; destination_airport?: string;
  price?: number; currency?: string; airline?: string; flight_number?: string;
  departure_at?: string; return_at?: string; transfers?: number; duration?: number; duration_to?: number;
  link?: string; found_at?: string;
}
type FareResponse<T> = { success?: boolean; data?: T; error?: string | null; currency?: string }
const VERIFIED_AVIASALES_AFFILIATE = 'https://aviasales.tpx.lv/ZOqzJHaf'
const MARKER_ID = '806576'
const ALLOWED_CURRENCIES = new Set(['USD','EUR','GBP','PKR','AED','SAR','CAD','AUD'])
function first(value: string | string[] | undefined): string { return (Array.isArray(value) ? value[0] : value ?? '').trim() }
function validDate(value: string): boolean { return /^\d{4}-\d{2}(-\d{2})?$/.test(value) && !Number.isNaN(Date.parse(value.length === 7 ? value + '-01' : value)) }
function asNumber(value: unknown): number | null { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : null }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const query = req.query ?? {}
  const origin = first(query.origin).toUpperCase()
  const destination = first(query.destination).toUpperCase()
  const departureAt = first(query.departure_at)
  const returnAt = first(query.return_at)
  const oneWayInput = first(query.one_way)
  if (oneWayInput !== 'true' && oneWayInput !== 'false') return res.status(400).json({ error: 'one_way must be explicitly true or false.' })
  const oneWay = oneWayInput === 'true'
  const currencyInput = first(query.currency).toUpperCase() || 'USD'
  const currency = (ALLOWED_CURRENCIES.has(currencyInput) ? currencyInput : 'USD').toLowerCase()
  const marketInput = first(query.market).toLowerCase()
  const market = /^[a-z]{2}$/.test(marketInput) ? marketInput : ''
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination) || origin === destination) return res.status(400).json({ error: 'Enter valid, different three-letter airport or city codes.' })
  if (!validDate(departureAt) || (!oneWay && !validDate(returnAt))) return res.status(400).json({ error: 'Enter a valid departure date and, for return trips, a valid return date.' })
  if (!oneWay && Date.parse(returnAt) < Date.parse(departureAt)) return res.status(400).json({ error: 'Return date must be on or after departure date.' })

  const token = process.env.TRAVELPAYOUTS_API_TOKEN?.trim()
  if (!token) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(503).json({ error: 'Flight fare data is not configured yet. Add the server-only TRAVELPAYOUTS_API_TOKEN to the deployment environment.' })
  }

  const endpoint = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates')
  endpoint.searchParams.set('origin', origin)
  endpoint.searchParams.set('destination', destination)
  endpoint.searchParams.set('departure_at', departureAt)
  endpoint.searchParams.set('one_way', String(oneWay))
  endpoint.searchParams.set('direct', 'false')
  endpoint.searchParams.set('sorting', 'price')
  endpoint.searchParams.set('limit', '50')
  endpoint.searchParams.set('page', '1')
  endpoint.searchParams.set('currency', currency)
  endpoint.searchParams.set('cy', currency)
  if (market) endpoint.searchParams.set('market', market)
  if (!oneWay) endpoint.searchParams.set('return_at', returnAt)

  try {
    const response = await fetch(endpoint, { headers: { 'X-Access-Token': token, Accept: 'application/json' }, signal: AbortSignal.timeout(12000) })
    if (!response.ok) {
      res.setHeader('Cache-Control', 'no-store')
      return res.status(response.status === 429 ? 429 : 502).json({ error: response.status === 401 ? 'Travelpayouts rejected the API token.' : 'Travelpayouts fare data is temporarily unavailable.', upstreamStatus: response.status })
    }
    const payload = await response.json() as FareResponse<AviasalesFare[]>
    let rows = Array.isArray(payload.data) ? payload.data : []
    let source: 'prices_for_dates' | 'prices/cheap' = 'prices_for_dates'
    if (!payload.success || rows.length === 0) {
      const legacy = new URL('https://api.travelpayouts.com/v1/prices/cheap')
      legacy.searchParams.set('origin', origin)
      legacy.searchParams.set('destination', destination)
      legacy.searchParams.set('depart_date', departureAt.slice(0, 7))
      if (!oneWay) legacy.searchParams.set('return_date', returnAt.slice(0, 7))
      legacy.searchParams.set('currency', currency)
      if (market) legacy.searchParams.set('market', market)
      const fallback = await fetch(legacy, { headers: { 'X-Access-Token': token, Accept: 'application/json' }, signal: AbortSignal.timeout(10000) })
      if (fallback.ok) {
        const legacyPayload = await fallback.json() as FareResponse<Record<string, Record<string, { price?: number; airline?: string; flight_number?: number | string; departure_at?: string; return_at?: string }>>>
        const destinationRows = legacyPayload.data?.[destination]
        if (legacyPayload.success && destinationRows) {
          rows = Object.values(destinationRows).map((item) => ({ origin, destination, price: item.price, currency, airline: item.airline, flight_number: String(item.flight_number ?? ''), departure_at: item.departure_at, return_at: item.return_at }))
          source = 'prices/cheap'
        }
      }
    }

    const offers = rows.filter((item) => asNumber(item.price) !== null && typeof item.departure_at === 'string')
      .filter((item) => item.departure_at!.slice(0, 10) === departureAt.slice(0, 10))
      .filter((item) => oneWay || (typeof item.return_at === 'string' && item.return_at.slice(0, 10) === returnAt.slice(0, 10)))
      .slice(0, 50)
      .map((item, index) => ({
        id: [origin, destination, item.airline ?? 'XX', item.flight_number ?? index, item.departure_at].join('-'),
        origin, destination, originAirport: item.origin_airport ?? origin, destinationAirport: item.destination_airport ?? destination,
        price: asNumber(item.price), currency: (item.currency ?? payload.currency ?? currency).toUpperCase(),
        airlineCode: (item.airline ?? '').toUpperCase(), flightNumber: String(item.flight_number ?? ''),
        departureAt: item.departure_at,
        arrivalAt: item.duration_to && item.departure_at ? new Date(new Date(item.departure_at).getTime() + item.duration_to * 60000).toISOString() : null,
        returnAt: item.return_at ?? null, stops: Number.isInteger(item.transfers) ? item.transfers : null,
        durationMinutes: asNumber(item.duration_to ?? item.duration), foundAt: item.found_at ?? null,
        bookingUrl: VERIFIED_AVIASALES_AFFILIATE, markerId: MARKER_ID, source, cached: true,
      }))
    res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=600')
    return res.status(200).json({ ok: true, origin, destination, currency: currency.toUpperCase(), markerId: MARKER_ID, source, cached: true, cacheWindow: 'Recent Aviasales search cache; not real-time inventory', offers })
  } catch {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(502).json({ error: 'Could not retrieve recent flight fare data. Please try again shortly.' })
  }
}
