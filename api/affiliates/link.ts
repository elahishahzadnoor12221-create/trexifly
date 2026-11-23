type Request = { method?: string; body?: { links?: Array<{ id: string; url: string }> } }
type Response = { setHeader(name: string, value: string): void; status(code: number): Response; json(body: unknown): Response }
declare const process: { env: { TRAVELPAYOUTS_API_TOKEN?: string; TRAVELPAYOUTS_TRS?: string; TRAVELPAYOUTS_TRS_ID?: string } }

const MARKER = 806576
const API_URL = 'https://api.travelpayouts.com/links/v1/create'
const HOSTS: Record<string, string[]> = {
  agoda: ['agoda.com', 'www.agoda.com'],
  booking: ['booking.com', 'www.booking.com'],
  expedia: ['expedia.com', 'www.expedia.com', 'hotels.com', 'www.hotels.com'],
  trip: ['trip.com', 'www.trip.com'],
}
type BrandId = keyof typeof HOSTS

function safeLinks(input: unknown): Array<{ id: BrandId; url: string }> {
  if (!Array.isArray(input)) return []
  return input.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return []
    const item = entry as { id?: unknown; url?: unknown }
    if (typeof item.id !== 'string' || !(item.id in HOSTS) || typeof item.url !== 'string') return []
    try {
      const url = new URL(item.url)
      const id = item.id as BrandId
      if (url.protocol !== 'https:' || !HOSTS[id].includes(url.hostname)) return []
      return [{ id, url: url.toString() }]
    } catch { return [] }
  }).slice(0, 10)
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const links = safeLinks(req.body?.links)
  if (!links.length) return res.status(400).json({ error: 'Provide valid supported hotel provider URLs.' })

  const fallback = links.map((item) => ({ id: item.id, url: item.url, status: 'unverified' as const, message: 'Direct search URL; Partner attribution has not been verified.' }))
  const token = process.env.TRAVELPAYOUTS_API_TOKEN?.trim()
  const trs = (process.env.TRAVELPAYOUTS_TRS ?? process.env.TRAVELPAYOUTS_TRS_ID ?? '').trim()
  if (!token || !trs || !/^\d+$/.test(trs)) return res.status(200).json({ links: fallback, configured: false })

  try {
    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers: { 'X-Access-Token': token, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ trs: Number(trs), marker: MARKER, shorten: false, links: links.map((item) => ({ url: item.url, sub_id: 'trexifly_stays_' + item.id })) }),
      signal: AbortSignal.timeout(12000),
    })
    if (!upstream.ok) return res.status(200).json({ links: fallback, configured: true })
    const payload = await upstream.json() as { result?: { links?: Array<{ url?: string; code?: string; partner_url?: string; message?: string }> } }
    const converted = new Map((payload.result?.links ?? []).map((item) => [item.url ?? '', item]))
    const result = links.map((item) => {
      const match = converted.get(item.url)
      if (match?.code === 'success' && typeof match.partner_url === 'string' && match.partner_url.startsWith('https://')) {
        return { id: item.id, url: match.partner_url, status: 'verified' as const, message: 'Partner booking link generated.' }
      }
      return { id: item.id, url: item.url, status: 'unverified' as const, message: match?.message ?? 'Brand programme approval or link conversion is pending.' }
    })
    return res.status(200).json({ links: result, configured: true })
  } catch {
    return res.status(200).json({ links: fallback, configured: true })
  }
}
