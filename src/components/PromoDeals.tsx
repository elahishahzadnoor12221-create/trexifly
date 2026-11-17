import { useEffect, useState } from 'react'

type PromoDeal = {
  brand: string
  title: string
  discount: string
  description: string
  affiliate_url: string
  expiry_date: string
}

const FALLBACK_DEALS: PromoDeal[] = [
  { brand: 'Yesim', title: 'Stay connected on your next trip', discount: '20% OFF', description: 'Save on travel eSIM connectivity. Check eligible plans, destinations and offer terms with Yesim.', affiliate_url: 'https://yesim.app/', expiry_date: '2027-02-28' },
  { brand: 'GigSky', title: 'Global travel eSIM savings', discount: '15% OFF', description: 'Explore international eSIM data plans and confirm eligible destinations and offer terms with GigSky.', affiliate_url: 'https://www.gigsky.com/', expiry_date: '2027-02-28' },
  { brand: 'AirHelp', title: 'Support for disrupted flights', discount: '9% OFF', description: 'Explore passenger-rights assistance and review service fees, eligibility and offer terms with AirHelp.', affiliate_url: 'https://www.airhelp.com/en/', expiry_date: '2026-12-31' },
]

const REQUIRED_COLUMNS = ['brand', 'title', 'discount', 'description', 'affiliate_url', 'expiry_date'] as const

function parseCsv(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { field += '"'; i += 1 }
      else if (char === '"') quoted = false
      else field += char
    } else if (char === '"' && field.length === 0) quoted = true
    else if (char === ',') { row.push(field.trim()); field = '' }
    else if (char === '\n') {
      row.push(field.trim()); field = ''
      if (row.some((cell) => cell.length > 0)) rows.push(row)
      row = []
    } else if (char !== '\r') field += char
  }
  row.push(field.trim())
  if (row.some((cell) => cell.length > 0)) rows.push(row)
  return rows
}

function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch { return null }
}

function currentLocalDate(): string {
  const now = new Date()
  return String(now.getFullYear()) + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0')
}

function isValidExpiryDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function filterActiveDeals(deals: PromoDeal[]): PromoDeal[] {
  const today = currentLocalDate()
  return deals.filter((deal) =>
    isValidExpiryDate(deal.expiry_date) &&
    deal.expiry_date >= today &&
    Boolean(deal.brand && deal.title && deal.discount && deal.description && safeHttpUrl(deal.affiliate_url)),
  )
}

function parseDealsCsv(csv: string): PromoDeal[] {
  const rows = parseCsv(csv)
  if (!rows.length) return []
  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, '').trim().toLowerCase())
  if (!REQUIRED_COLUMNS.every((column) => headers.includes(column))) throw new Error('Promo CSV is missing one or more required column headers.')
  const index = (column: typeof REQUIRED_COLUMNS[number]) => headers.indexOf(column)
  return rows.slice(1).map((row) => ({
    brand: (row[index('brand')] ?? '').trim(),
    title: (row[index('title')] ?? '').trim(),
    discount: (row[index('discount')] ?? '').trim(),
    description: (row[index('description')] ?? '').trim(),
    affiliate_url: (row[index('affiliate_url')] ?? '').trim(),
    expiry_date: (row[index('expiry_date')] ?? '').trim(),
  }))
}

const SHEET_CSV_URL = (import.meta as ImportMeta & { env: { VITE_PROMO_SHEET_CSV_URL?: string } }).env.VITE_PROMO_SHEET_CSV_URL?.trim()

export function PromoDeals() {
  const [deals, setDeals] = useState<PromoDeal[]>(() => filterActiveDeals(FALLBACK_DEALS))
  const [source, setSource] = useState<'fallback' | 'sheet'>('fallback')
  const [loading, setLoading] = useState(Boolean(SHEET_CSV_URL))

  useEffect(() => {
    if (!SHEET_CSV_URL) return
    const controller = new AbortController()
    const load = async () => {
      try {
        const url = new URL(SHEET_CSV_URL)
        url.searchParams.set('_trexifly_refresh', String(Date.now()))
        const response = await fetch(url.toString(), { method: 'GET', cache: 'no-store', signal: controller.signal, headers: { Accept: 'text/csv,text/plain;q=0.9,*/*;q=0.8' } })
        if (!response.ok) throw new Error('Promo sheet returned HTTP ' + response.status)
        const active = filterActiveDeals(parseDealsCsv(await response.text()))
        if (!controller.signal.aborted) { setDeals(active); setSource('sheet') }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('[Trexifly promo deals] Live sheet unavailable; using local fallback.', error)
          setDeals(filterActiveDeals(FALLBACK_DEALS))
          setSource('fallback')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [])

  return (
    <section aria-labelledby="promo-deals-title" className="bg-[#FFF7F2] py-11 sm:py-14">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Limited-time partner offers</p>
            <h2 id="promo-deals-title" className="mt-2 text-2xl font-extrabold text-[#172B4D] sm:text-3xl">Exclusive Travel Promo Deals</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Explore current partner offers. Check eligibility, final pricing and full terms on the partner website before purchase.</p>
          </div>
          <span className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">{loading ? 'Checking latest offers…' : source === 'sheet' ? 'Live sheet feed' : 'Partner offers'}</span>
        </div>
        {deals.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {deals.map((deal) => (
              <article key={deal.brand + '-' + deal.expiry_date} className="flex h-full flex-col rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#FF5500] hover:shadow-xl hover:shadow-orange-100">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-lg bg-[#FFF0E8] px-3 py-1.5 text-sm font-extrabold text-[#B83B00]">{deal.brand}</span>
                  <span className="rounded-full bg-[#FF5500] px-3 py-1.5 text-sm font-extrabold text-white">{deal.discount}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#172B4D]">{deal.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{deal.description}</p>
                <p className="mt-4 text-xs text-slate-500">Offer ends {new Date(deal.expiry_date + 'T23:59:59').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                <a href={safeHttpUrl(deal.affiliate_url) ?? '#'} target="_blank" rel="noopener noreferrer sponsored" className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#FF5500] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#E64A00]">View offer <span aria-hidden="true" className="ml-2">↗</span></a>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Always-on travel discovery</p>
              <h3 className="mt-2 text-xl font-extrabold text-[#172B4D]">Compare Live Flight &amp; Hotel Deals</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">No current promo codes are listed right now. Compare travel options and explore your next journey instead.</p>
            </div>
            <a href="/?tab=flights#search-widget" className="shrink-0 rounded-xl bg-[#FF5500] px-5 py-3 text-sm font-bold text-white hover:bg-[#E64A00]">Compare travel deals</a>
          </div>
        )}
      </div>
    </section>
  )
}
