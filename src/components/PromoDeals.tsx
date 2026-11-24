import { useEffect, useState } from 'react'
import { findVerifiedAffiliatePartner, isVerifiedAffiliateUrl } from '../lib/affiliates'
import { recordPartnerCheckout, type TripCategory } from '../lib/trips'

type PromoDeal = {
  brand: string
  title: string
  discount: string
  description: string
  affiliate_url: string
  expiry_date: string
  code?: string
  evergreen?: boolean
}

const FALLBACK_DEALS: PromoDeal[] = [
  {
    brand: 'Yesim',
    title: '20% OFF First eSIM Order',
    discount: '20% OFF',
    description: '20% off your first eSIM order across 200+ countries.',
    affiliate_url: 'https://yesim.tpx.lv/IwHxgG89',
    expiry_date: '2027-02-28',
    code: 'YesimX',
  },
  {
    brand: 'GigSky',
    title: '15% OFF Global eSIM Plans',
    discount: '15% OFF',
    description: '15% off sitewide on GigSky eSIM plans (min. $4 order, excludes Inflight & North Sea plans).',
    affiliate_url: 'https://gigsky.tpx.lv/cI4I5CsI',
    expiry_date: '2027-02-28',
    code: 'TP15',
  },
  {
    brand: 'AirHelp',
    title: '9% OFF TravelPass (Silver, Gold & Platinum)',
    discount: '9% OFF',
    description: 'Flight delay & cancellation compensation protection. Valid through Dec 31, 2026.',
    affiliate_url: 'https://airhelp.tpx.lv/Ccn3ouk7',
    expiry_date: '2026-12-31',
    code: 'TPO9',
  },
]

// Always-on partner links: no promo code, no expiry, never hidden by the expiry filter.
const EVERGREEN_DEALS: PromoDeal[] = [
  {
    brand: 'Intui.travel',
    title: 'Airport Transfers',
    discount: 'Transfers',
    description: 'Book reliable airport transfers in destinations worldwide. Check prices and terms with Intui.travel.',
    affiliate_url: 'https://intui.tpx.lv/6QOOPhJd',
    expiry_date: '',
    evergreen: true,
  },
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
    Boolean(deal.brand && deal.title && deal.discount && deal.description && safeHttpUrl(deal.affiliate_url) && isVerifiedAffiliateUrl(deal.affiliate_url)) &&
    (deal.evergreen === true || (isValidExpiryDate(deal.expiry_date) && deal.expiry_date >= today)),
  )
}

// Adds the evergreen partner links without duplicating a brand already present in the list.
function withEvergreen(deals: PromoDeal[]): PromoDeal[] {
  const brands = new Set(deals.map((deal) => deal.brand.toLowerCase()))
  return [...deals, ...EVERGREEN_DEALS.filter((deal) => !brands.has(deal.brand.toLowerCase()))]
}

function parseDealsCsv(csv: string): PromoDeal[] {
  const rows = parseCsv(csv)
  if (!rows.length) return []
  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, '').trim().toLowerCase())
  if (!REQUIRED_COLUMNS.every((column) => headers.includes(column))) throw new Error('Promo CSV is missing one or more required column headers.')
  const index = (column: string) => headers.indexOf(column)
  const codeIndex = index('code') // optional column: promo_code is accepted too
  const promoCodeIndex = index('promo_code')
  return rows.slice(1).map((row) => ({
    brand: (row[index('brand')] ?? '').trim(),
    title: (row[index('title')] ?? '').trim(),
    discount: (row[index('discount')] ?? '').trim(),
    description: (row[index('description')] ?? '').trim(),
    affiliate_url: (row[index('affiliate_url')] ?? '').trim(),
    expiry_date: (row[index('expiry_date')] ?? '').trim(),
    code: ((codeIndex >= 0 ? row[codeIndex] : promoCodeIndex >= 0 ? row[promoCodeIndex] : '') ?? '').trim() || undefined,
  }))
}

const SHEET_CSV_URL = (import.meta as ImportMeta & { env: { VITE_PROMO_SHEET_CSV_URL?: string } }).env.VITE_PROMO_SHEET_CSV_URL?.trim()

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Fallback for browsers/contexts where the Clipboard API is unavailable.
      const input = document.createElement('textarea')
      input.value = code
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      try { document.execCommand('copy') } catch { /* ignore */ }
      document.body.removeChild(input)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-dashed border-[#FF5500] bg-[#FFF7F2] px-3 py-2">
      <span className="min-w-0 truncate font-mono text-sm font-bold text-[#172B4D]">Code: {code}</span>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={'Copy promo code ' + code}
        className="shrink-0 rounded-lg bg-[#172B4D] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#0F1F3A]"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

export function PromoDeals() {
  const [deals, setDeals] = useState<PromoDeal[]>(() => filterActiveDeals(withEvergreen(FALLBACK_DEALS)))
  const [source, setSource] = useState<'fallback' | 'sheet'>('fallback')
  const [loading, setLoading] = useState(Boolean(SHEET_CSV_URL))
  const hasLimitedOffers = deals.some((deal) => deal.evergreen !== true)

  useEffect(() => {
    if (!SHEET_CSV_URL) return
    const controller = new AbortController()
    const load = async () => {
      try {
        const url = new URL(SHEET_CSV_URL)
        url.searchParams.set('_trexifly_refresh', String(Date.now()))
        const response = await fetch(url.toString(), { method: 'GET', cache: 'no-store', signal: controller.signal, headers: { Accept: 'text/csv,text/plain;q=0.9,*/*;q=0.8' } })
        if (!response.ok) throw new Error('Promo sheet returned HTTP ' + response.status)
        const active = filterActiveDeals(withEvergreen(parseDealsCsv(await response.text())))
        if (!controller.signal.aborted) { setDeals(active); setSource('sheet') }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('[Trexifly promo deals] Live sheet unavailable; using local fallback.', error)
          setDeals(filterActiveDeals(withEvergreen(FALLBACK_DEALS)))
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
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">{hasLimitedOffers ? 'Limited-time partner offers' : 'Partner travel services'}</p>
            <h2 id="promo-deals-title" className="mt-2 text-2xl font-extrabold text-[#172B4D] sm:text-3xl">{hasLimitedOffers ? 'Exclusive Travel Promo Deals' : 'Explore Travel Partner Services'}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Explore current partner offers. Check eligibility, final pricing and full terms on the partner website before purchase.</p>
          </div>
          <span className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">{loading ? 'Checking latest offers\u2026' : source === 'sheet' ? 'Live sheet feed' : 'Partner offers'}</span>
        </div>
        {deals.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {deals.map((deal) => {
              const partner = findVerifiedAffiliatePartner(deal.affiliate_url)
              const category: TripCategory | null = partner ? (partner.category === 'tours' ? 'activities' : partner.category) : null
              return <article key={deal.brand + '-' + (deal.evergreen ? 'evergreen' : deal.expiry_date)} className="flex h-full flex-col rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#FF5500] hover:shadow-xl hover:shadow-orange-100">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-lg bg-[#FFF0E8] px-3 py-1.5 text-sm font-extrabold text-[#B83B00]">{deal.brand}</span>
                  {deal.evergreen ? null : <span className="rounded-full bg-[#FF5500] px-3 py-1.5 text-sm font-extrabold text-white">{deal.discount}</span>}
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#172B4D]">{deal.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{deal.description}</p>
                {deal.code ? <CopyCode code={deal.code} /> : null}
                {deal.evergreen ? null : (
                  <p className="mt-4 text-xs text-slate-500">Offer ends {new Date(deal.expiry_date + 'T23:59:59').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                )}
                <a href={partner?.url ?? '#'} onClick={() => { if (partner && category) recordPartnerCheckout({ title: deal.title, category, origin: '', destination: deal.brand, departureDate: '', returnDate: '', partner: partner.name, partnerUrl: partner.url }) }} data-affiliate-status="verified" target="_blank" rel="nofollow noopener sponsored" className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#FF5500] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#E64A00]">{deal.evergreen ? 'Book transfer' : 'Claim Deal'} <span aria-hidden="true" className="ml-2">{'\u2197'}</span></a>
              </article>
            })}
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
