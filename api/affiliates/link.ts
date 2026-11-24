type Request = {
  method?: string
  query?: Record<string, string | string[] | undefined>
}
type Response = {
  setHeader(name: string, value: string): void
  status(code: number): Response
  json(body: unknown): Response
  end(): void
}
declare const process: { env: { TRAVELPAYOUTS_API_TOKEN?: string; TRAVELPAYOUTS_TRS?: string; TRAVELPAYOUTS_TRS_ID?: string } }

const MARKER = 806576
const API_URL = 'https://api.travelpayouts.com/links/v1/create'

const PARTNERS = {
  agoda: { category: 'hotels', hosts: ['agoda.com', 'www.agoda.com'], shortName: 'agoda' },
  booking: { category: 'hotels', hosts: ['booking.com', 'www.booking.com'], shortName: 'booking' },
  expedia: { category: 'hotels', hosts: ['expedia.com', 'www.expedia.com', 'hotels.com', 'www.hotels.com'], shortName: 'expedia' },
  trip: { category: 'hotels', hosts: ['trip.com', 'www.trip.com'], shortName: 'trip', fallback: 'https://www.trip.com/t/SsY6ZaegIX2' },
  autoeurope: { category: 'cars', hosts: ['autoeurope.com', 'www.autoeurope.com'], shortName: 'autoeurope', clickDestination: 'https://www.autoeurope.com/', fallback: 'https://autoeurope.tpx.lv/1NuZscel' },
  qeeq: { category: 'cars', hosts: ['qeeq.com', 'www.qeeq.com'], shortName: 'qeeq', clickDestination: 'https://www.qeeq.com/', fallback: 'https://qeeq.tpx.lv/n9oGqafJ' },
  tiqets: { category: 'tours', hosts: ['tiqets.com', 'www.tiqets.com'], shortName: 'tiqets', clickDestination: 'https://www.tiqets.com/en/', fallback: 'https://tiqets.tpx.lv/sSYehXWU' },
  gettransfer: { category: 'transfers', hosts: ['gettransfer.com', 'www.gettransfer.com'], shortName: 'gettransfer', clickDestination: 'https://www.gettransfer.com/', fallback: 'https://gettransfer.tpx.lv/yYXGNhMm' },
  intui: { category: 'transfers', hosts: ['intui.travel', 'www.intui.travel'], shortName: 'intui', clickDestination: 'https://www.intui.travel/', fallback: 'https://intui.tpx.lv/6QOOPhJd' },
  kiwitaxi: { category: 'transfers', hosts: ['kiwitaxi.com', 'www.kiwitaxi.com'], shortName: 'kiwitaxi', clickDestination: 'https://kiwitaxi.com/', fallback: 'https://kiwitaxi.tpx.lv/wN8KUFkg' },
  klook: { category: 'hotels', hosts: ['klook.com', 'www.klook.com'], shortName: 'klook', clickDestination: 'https://www.klook.com/hotels/?aid=144776', fallback: 'https://klook.tpx.lv/LvAH7l4w' },
  kkday: { category: 'hotels', hosts: ['kkday.com', 'www.kkday.com'], shortName: 'kkday', clickDestination: 'https://www.kkday.com/en', fallback: 'https://kkday.tpx.lv/x5gqHfDJ' }
} as const

type PartnerId = keyof typeof PARTNERS
type SafeLink = { id: PartnerId; category: string; url: string; subId: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function normalizeAffiliateLinks(input: unknown): SafeLink[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > 10) return []
  const result: SafeLink[] = []
  const seen = new Set<string>()
  for (const entry of input) {
    if (!isRecord(entry) || typeof entry.id !== 'string' || typeof entry.url !== 'string') return []
    if (!Object.prototype.hasOwnProperty.call(PARTNERS, entry.id)) return []
    const id = entry.id as PartnerId
    try {
      const url = new URL(entry.url)
      const allowedHosts: readonly string[] = PARTNERS[id].hosts
      if (url.protocol !== 'https:' || url.username || url.password || url.port || !allowedHosts.includes(url.hostname) || seen.has(url.toString())) return []
      seen.add(url.toString())
      result.push({ id, category: PARTNERS[id].category, url: url.toString(), subId: `trexifly_${PARTNERS[id].category}_${id}` })
    } catch { return [] }
  }
  return result
}

export function isTravelpayoutsShortLink(value: unknown, id: PartnerId): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    const shortName = PARTNERS[id].shortName
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      (url.hostname === `${shortName}.tp.st` || url.hostname === `${shortName}.tpx.lv`)
  } catch { return false }
}

async function createPartnerLink(item: SafeLink): Promise<string | null> {
  const token = process.env.TRAVELPAYOUTS_API_TOKEN?.trim()
  const trs = (process.env.TRAVELPAYOUTS_TRS ?? process.env.TRAVELPAYOUTS_TRS_ID ?? '').trim()
  if (!token || !trs || !/^\d+$/.test(trs) || Number(trs) === MARKER) return null
  try {
    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers: { 'X-Access-Token': token, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ trs: Number(trs), marker: MARKER, shorten: true, links: [{ url: item.url, sub_id: item.subId }] }),
      signal: AbortSignal.timeout(8000),
    })
    if (!upstream.ok) return null
    const payload = await upstream.json() as { result?: { links?: Array<{ url?: string; code?: string; partner_url?: string }> } }
    const match = payload.result?.links?.find(link => link.url === item.url)
    return match?.code === 'success' && isTravelpayoutsShortLink(match.partner_url, item.id) ? match.partner_url : null
  } catch { return null }
}

function queryValue(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : ''
}

function validIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function buildTripHotelSearch(query: Record<string, string | string[] | undefined>): SafeLink | null {
  const destination = queryValue(query.to).trim()
  const checkin = queryValue(query.out)
  const checkout = queryValue(query.back)
  const adults = Number(queryValue(query.adults))
  const children = Number(queryValue(query.children) || 0)
  const rooms = Number(queryValue(query.rooms) || 1)
  const agesRaw = queryValue(query.childAges)
  const ages = agesRaw ? agesRaw.split(',').map(value => Number(value)) : []
  if (!destination || destination.length > 120 || /[\u0000-\u001f]/.test(destination)) return null
  if (!validIsoDate(checkin) || !validIsoDate(checkout) || checkout <= checkin) return null
  if (!Number.isInteger(adults) || adults < 1 || adults > 5 || !Number.isInteger(children) || children < 0 || children > 5 ||
      !Number.isInteger(rooms) || rooms < 1 || rooms > 6 || ages.length !== children ||
      ages.some(age => !Number.isInteger(age) || age < 0 || age > 17)) return null

  const url = new URL('https://www.trip.com/hotels/list')
  url.searchParams.set('searchWord', destination)
  url.searchParams.set('checkin', checkin)
  url.searchParams.set('checkout', checkout)
  url.searchParams.set('adult', String(adults))
  url.searchParams.set('children', String(children))
  url.searchParams.set('crn', String(rooms))
  url.searchParams.set('curr', 'USD')
  if (ages.length) url.searchParams.set('childAges', ages.join(','))
  return normalizeAffiliateLinks([{ id: 'trip', url: url.toString() }])[0] ?? null
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'GET') {
    const query = req.query ?? {}
    const id = queryValue(query.id)
    if (!Object.prototype.hasOwnProperty.call(PARTNERS, id)) return res.status(400).json({ error: 'Unsupported affiliate provider.' })
    const partner = PARTNERS[id as PartnerId]

    // Dynamic hotel search is currently enabled only for the supplied Trip.com affiliate.
    if (id === 'trip' && ['to', 'out', 'back', 'adults', 'children', 'rooms', 'childAges'].some(key => key in query)) {
      const allowedKeys = new Set(['id', 'to', 'out', 'back', 'adults', 'children', 'rooms', 'childAges'])
      if (Object.keys(query).some(key => !allowedKeys.has(key))) return res.status(400).json({ error: 'Unsupported hotel search parameter.' })
      const safe = buildTripHotelSearch(query)
      if (!safe) return res.status(400).json({ error: 'Invalid hotel search details.' })
      const generated = await createPartnerLink(safe)
      const fallback = PARTNERS.trip.fallback
      if (!isTravelpayoutsShortLink(generated, 'trip') && !/^https:\/\/www\.trip\.com\/t\/[A-Za-z0-9]+$/.test(fallback)) {
        return res.status(500).json({ error: 'Hotel partner fallback failed validation.' })
      }
      res.setHeader('Cache-Control', 'no-store')
      res.setHeader('Location', generated ?? fallback)
      res.status(302)
      return res.end()
    }

    if (id === 'kiwitaxi' && ('from' in query || 'to' in query)) {
      const allowedKeys = new Set(['id', 'from', 'to'])
      if (Object.keys(query).some(key => !allowedKeys.has(key))) return res.status(400).json({ error: 'Unsupported Kiwitaxi route parameter.' })
      const from = queryValue(query.from).trim()
      const to = queryValue(query.to).trim()
      if (!from || !to || from.length > 120 || to.length > 120 || /[\x00-\x1f]/.test(from + to)) {
        return res.status(400).json({ error: 'Invalid Kiwitaxi route details.' })
      }
      const destination = new URL('https://kiwitaxi.com/en/search')
      destination.searchParams.set('from', from)
      destination.searchParams.set('to', to)
      const safe = normalizeAffiliateLinks([{ id: 'kiwitaxi', url: destination.toString() }])[0]
      const fallback = PARTNERS.kiwitaxi.fallback
      if (!safe || !isTravelpayoutsShortLink(fallback, 'kiwitaxi')) return res.status(500).json({ error: 'Kiwitaxi route fallback failed validation.' })
      const generated = await createPartnerLink(safe)
      res.setHeader('Cache-Control', 'no-store')
      res.setHeader('Location', generated ?? fallback)
      res.status(302)
      return res.end()
    }

    if (Object.keys(query).length !== 1) return res.status(400).json({ error: 'Provide only a supported provider ID.' })
    if (!('clickDestination' in partner) || !('fallback' in partner)) return res.status(400).json({ error: 'No customer redirect is configured for this provider.' })
    const safe = normalizeAffiliateLinks([{ id, url: partner.clickDestination }])
    if (!safe.length || !isTravelpayoutsShortLink(partner.fallback, id as PartnerId)) return res.status(500).json({ error: 'Provider redirect configuration failed validation.' })
    const generated = await createPartnerLink(safe[0])
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.setHeader('Location', generated ?? partner.fallback)
    res.status(302)
    return res.end()
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
