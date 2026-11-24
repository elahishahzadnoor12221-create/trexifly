import { envFor, isAdmin, jsonHeaders, type ApiReq, type ApiRes } from '../../src/lib/alertsServer.js'



const API_URL = 'https://api.travelpayouts.com/statistics/v1/execute_query'
const CAMPAIGNS = [
  { id: 'kiwitaxi', campaignId: 1, name: 'Kiwitaxi', category: 'Transfers' },
  { id: 'intui', campaignId: 22, name: 'Intui.travel', category: 'Transfers' },
  { id: 'tiqets', campaignId: 89, name: 'Tiqets', category: 'Tours' },
  { id: 'aviasales', campaignId: 100, name: 'Aviasales', category: 'Flights' },
  { id: 'klook', campaignId: 137, name: 'Klook', category: 'Hotels' },
  { id: 'autoeurope', campaignId: 143, name: 'AutoEurope (EU/UK)', category: 'Cars' },
  { id: 'gettransfer', campaignId: 147, name: 'GetTransfer.com', category: 'Transfers' },
  { id: 'qeeq', campaignId: 172, name: 'QEEQ', category: 'Cars' },
  { id: 'kkday', campaignId: 633, name: 'KKday', category: 'Hotels & Tours' },
] as const

const requestWindows = new Map<string, { count: number; resetAt: number }>()

function queryValue(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : ''
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(value + 'T00:00:00.000Z')
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function numberValue(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function allowRequest(req: ApiReq): boolean {
  const ipHeader = req.headers?.['x-forwarded-for'] ?? req.headers?.['X-Forwarded-For']
  const ip = (Array.isArray(ipHeader) ? ipHeader[0] : ipHeader)?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const current = requestWindows.get(ip)
  if (!current || current.resetAt <= now) {
    requestWindows.set(ip, { count: 1, resetAt: now + 60_000 })
    if (requestWindows.size > 500) {
      for (const [key, value] of requestWindows) if (value.resetAt <= now) requestWindows.delete(key)
    }
    return true
  }
  if (current.count >= 12) return false
  current.count += 1
  return true
}

export default async function handler(req: ApiReq, res: ApiRes, ctx?: { env?: import('../../src/lib/alertsServer.js').AlertEnv }) {
  jsonHeaders(res)
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const env = envFor(req, ctx)
  if (!await isAdmin(req, env)) return res.status(401).json({ error: 'Admin login required' })
  if (!allowRequest(req)) return res.status(429).json({ error: 'Too many reporting requests. Wait one minute and try again.' })

  const allowedQueryKeys = new Set(['from', 'to'])
  if (Object.keys(req.query ?? {}).some(key => !allowedQueryKeys.has(key))) {
    return res.status(400).json({ error: 'Only from and to date filters are supported.' })
  }

  const today = new Date().toISOString().slice(0, 10)
  const defaultStart = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const from = queryValue(req.query?.from) || defaultStart
  const to = queryValue(req.query?.to) || today
  if (!validDate(from) || !validDate(to) || from > to) {
    return res.status(400).json({ error: 'Provide a valid date range in YYYY-MM-DD format.' })
  }
  const days = (Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86_400_000
  if (days > 365) return res.status(400).json({ error: 'Date range cannot exceed 366 calendar days.' })

  const token = env.TRAVELPAYOUTS_API_TOKEN?.trim()
  const trafficSourceId = Number(env.TRAVELPAYOUTS_TRS?.trim())
  // The partner marker is not a project/traffic-source ID.
  if (!token || !Number.isSafeInteger(trafficSourceId) || trafficSourceId <= 0 || trafficSourceId === 806576) {
    return res.status(503).json({ error: 'Travelpayouts reporting is not configured on this server.' })
  }

  try {
    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'X-Access-Token': token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        fields: [
          'campaign_id',
          'campaign_name_en',
          'redirects_count',
          'searches_count',
          'paid_actions_count',
          'processing_actions_count',
          'cancelled_actions_count',
          'paid_profit_usd_sum',
          'processing_profit_usd_sum',
        ],
        filters: [
          { field: 'date', op: 'ge', value: from },
          { field: 'date', op: 'le', value: to },
          { field: 'traffic_source', op: 'eq', value: trafficSourceId },
        ],
        group: ['campaign_id', 'campaign_name_en'],
        offset: 0,
        limit: 1000,
      }),
      signal: AbortSignal.timeout(12_000),
    })

    if (!upstream.ok) {
      return res.status(502).json({ error: 'Travelpayouts reporting service is temporarily unavailable.' })
    }

    const payload = await upstream.json() as { results?: Array<Record<string, unknown>> }
    const rawRows = Array.isArray(payload.results) ? payload.results : []
    const rows = CAMPAIGNS.map(campaign => {
      const source = rawRows.find(row => numberValue(row.campaign_id) === campaign.campaignId)
      return {
        id: campaign.id,
        campaignId: campaign.campaignId,
        name: campaign.name,
        category: campaign.category,
        redirects: numberValue(source?.redirects_count),
        searches: numberValue(source?.searches_count),
        paidBookings: numberValue(source?.paid_actions_count),
        processingBookings: numberValue(source?.processing_actions_count),
        cancelledBookings: numberValue(source?.cancelled_actions_count),
        paidProfitUsd: numberValue(source?.paid_profit_usd_sum),
        processingProfitUsd: numberValue(source?.processing_profit_usd_sum),
      }
    })

    const totals = rows.reduce((sum, row) => ({
      redirects: sum.redirects + row.redirects,
      searches: sum.searches + row.searches,
      paidBookings: sum.paidBookings + row.paidBookings,
      processingBookings: sum.processingBookings + row.processingBookings,
      cancelledBookings: sum.cancelledBookings + row.cancelledBookings,
      paidProfitUsd: sum.paidProfitUsd + row.paidProfitUsd,
      processingProfitUsd: sum.processingProfitUsd + row.processingProfitUsd,
    }), {
      redirects: 0,
      searches: 0,
      paidBookings: 0,
      processingBookings: 0,
      cancelledBookings: 0,
      paidProfitUsd: 0,
      processingProfitUsd: 0,
    })

    return res.status(200).json({ from, to, currency: 'USD', rows, totals })
  } catch {
    return res.status(502).json({ error: 'Travelpayouts reporting service is temporarily unavailable.' })
  }
}
