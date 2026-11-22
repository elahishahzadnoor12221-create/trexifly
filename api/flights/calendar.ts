export const config = { runtime: 'edge' }

type Query = Record<string, string | string[] | undefined>
type Fare = { price?: number | string; currency?: string; departure_at?: string; depart_date?: string; value?: number | string; origin?: string; destination?: string; airline?: string; transfers?: number; number_of_changes?: number; flight_number?: string | number; expires_at?: string; actual?: boolean }
const MARKER_ID = '806576'
const CURRENCIES = new Set(['USD','EUR','GBP','PKR','AED','SAR','CAD','AUD'])
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value ?? '').trim()
const validMonth = (value: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
const numericPrice = (value: unknown) => { const price = Number(value); return Number.isFinite(price) && price > 0 ? price : null }
function jsonResponse(status: number, body: unknown, cacheControl = 'no-store') {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cacheControl } })
}
function normalizeFare(value: Record<string, unknown>, dateKey = ''): Fare | null {
  const departure = typeof value.departure_at === 'string' ? value.departure_at : typeof value.depart_date === 'string' ? value.depart_date : dateKey
  const price = numericPrice(value.price ?? value.value)
  if (!price || !/^\d{4}-\d{2}-\d{2}/.test(departure)) return null
  return { ...value, price, departure_at: departure, transfers: Number(value.transfers ?? value.number_of_changes) } as Fare
}
function extractRows(payload: unknown): Fare[] {
  if (!payload || typeof payload !== 'object') return []
  const data = (payload as { data?: unknown }).data
  if (!data || typeof data !== 'object') return []
  if (Array.isArray(data)) return data.flatMap(item => item && typeof item === 'object' ? (normalizeFare(item as Record<string, unknown>) ?? []) : [])
  const rows: Fare[] = []
  const visit = (value: unknown, key = '') => {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) { value.forEach(item => visit(item)); return }
    const item = value as Record<string, unknown>
    const normalized = normalizeFare(item, key)
    if (normalized) { rows.push(normalized); return }
    Object.entries(item).forEach(([childKey, child]) => visit(child, childKey))
  }
  visit(data)
  return rows
}
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return jsonResponse(405, { error: 'Method not allowed' })
  const q = Object.fromEntries(new URL(req.url).searchParams.entries()) as Query
  const origin = first(q.origin).toUpperCase(), destination = first(q.destination).toUpperCase()
  const month = first(q.month), trip = first(q.one_way) === 'true' ? 'one-way' : 'round-trip'
  const currencyInput = first(q.currency).toUpperCase() || 'USD'
  const currency = (CURRENCIES.has(currencyInput) ? currencyInput : 'USD').toLowerCase()
  const returnDate = first(q.return_at)
  const selectedDeparture = first(q.departure_at)
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination) || origin === destination || !validMonth(month)) return jsonResponse(400, { error: 'Valid origin, destination and YYYY-MM month are required.' })
  const now = new Date(); const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const target = new Date(month + '-01T00:00:00Z')
  const lastAllowed = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 11, 1))
  if (target < new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)) || target > lastAllowed) return jsonResponse(400, { error: 'Calendar supports the current month through 11 months ahead.' })
  const token = process.env.TRAVELPAYOUTS_API_TOKEN?.trim()
  if (!token) return jsonResponse(503, { error: 'Flight calendar is not configured.' })
  const headers = { 'X-Access-Token': token, Accept: 'application/json' }
  const attempts: Array<{ url: URL; source: string }> = []
  const legacy = new URL('https://api.travelpayouts.com/v1/prices/calendar')
  legacy.searchParams.set('origin', origin); legacy.searchParams.set('destination', destination)
  legacy.searchParams.set('depart_date', month)
  legacy.searchParams.set('calendar_type', 'departure_date'); legacy.searchParams.set('currency', currency)
  if (trip === 'round-trip' && /^\d{4}-\d{2}-\d{2}$/.test(returnDate)) legacy.searchParams.set('return_date', returnDate)
  attempts.push({ url: legacy, source: 'v1/prices/calendar' })
  const matrix = new URL('https://api.travelpayouts.com/v2/prices/month-matrix')
  matrix.searchParams.set('origin', origin); matrix.searchParams.set('destination', destination)
  matrix.searchParams.set('month', month + '-01'); matrix.searchParams.set('currency', currency)
  matrix.searchParams.set('limit', '30'); matrix.searchParams.set('page', '1')
  matrix.searchParams.set('sorting', 'price'); matrix.searchParams.set('trip_class', '0')
  matrix.searchParams.set('show_to_affiliates', 'true'); matrix.searchParams.set('one_way', String(trip === 'one-way'))
  if (trip === 'round-trip') {
    const departureTime = /^\d{4}-\d{2}-\d{2}$/.test(selectedDeparture) ? Date.parse(selectedDeparture + 'T00:00:00Z') : target.getTime()
    const returnTime = /^\d{4}-\d{2}-\d{2}$/.test(returnDate) ? Date.parse(returnDate + 'T00:00:00Z') : Number.NaN
    const stayWeeks = Number.isFinite(returnTime) && returnTime > departureTime ? Math.max(1, Math.ceil((returnTime - departureTime) / 604800000)) : 1
    matrix.searchParams.set('trip_duration', String(stayWeeks))
  }
  attempts.push({ url: matrix, source: 'v2/prices/month-matrix' })
  let rows: Fare[] = []; let source = ''
  for (const attempt of attempts) {
    try {
      const response = await fetch(attempt.url, { headers, signal: AbortSignal.timeout(10000) })
      if (!response.ok) continue
      const payload = await response.json() as { success?: boolean }
      const parsed = extractRows(payload).filter(row => numericPrice(row.price) && row.actual !== false && (!row.expires_at || Date.parse(row.expires_at) >= Date.now()) && typeof row.departure_at === 'string' && row.departure_at.slice(0, 7) === month)
      if (parsed.length) { rows = parsed; source = attempt.source; break }
    } catch { /* Try the documented fallback endpoint. */ }
  }
  const byDate = new Map<string, number>()
  for (const row of rows) {
    const date = row.departure_at!.slice(0, 10), price = numericPrice(row.price)
    if (!price || date < today.toISOString().slice(0, 10)) continue
    const current = byDate.get(date)
    if (current === undefined || price < current) byDate.set(date, price)
  }
  const prices = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, price]) => ({ date, price, currency: currency.toUpperCase() }))
  return jsonResponse(200, { ok: true, origin, destination, month, currency: currency.toUpperCase(), tripType: trip, markerId: MARKER_ID, source: source || 'no-cached-data', cached: true, prices, message: prices.length ? undefined : 'No cached partner fares are currently available for this month. Check live availability with the booking partner.' }, 'public, max-age=900, stale-while-revalidate=1800')
}
