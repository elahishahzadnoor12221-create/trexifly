import { useEffect, useState } from 'react'
import { Link } from 'react-router'

type AffiliateRow = {
  id: string
  campaignId: number
  name: string
  category: string
  redirects: number
  searches: number
  paidBookings: number
  processingBookings: number
  cancelledBookings: number
  paidProfitUsd: number
  processingProfitUsd: number
}
type AffiliateReport = {
  from: string
  to: string
  currency: 'USD'
  rows: AffiliateRow[]
  totals: Omit<AffiliateRow, 'id' | 'campaignId' | 'name' | 'category'>
}

function dateOffset(days: number): string {
  const value = new Date()
  value.setUTCDate(value.getUTCDate() - days)
  return value.toISOString().slice(0, 10)
}
function count(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}
function usd(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
}

export function AdminAffiliatePage() {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [from, setFrom] = useState(() => dateOffset(29))
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [report, setReport] = useState<AffiliateReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadReport() {
    setLoading(true)
    setError('')
    try {
      const query = new URLSearchParams({ from, to })
      const response = await fetch('/api/alerts/affiliates?' + query.toString(), { headers: { Accept: 'application/json' } })
      const payload = await response.json() as AffiliateReport & { error?: string }
      if (response.status === 401) {
        setAuthenticated(false)
        throw new Error('Your admin session has expired. Sign in again to view affiliate reports.')
      }
      if (!response.ok) throw new Error(payload.error || 'Could not load the affiliate report.')
      setReport(payload)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load the affiliate report.')
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    fetch('/api/alerts/auth')
      .then(response => response.json() as Promise<{ authenticated?: boolean }>)
      .then(payload => {
        if (active) setAuthenticated(payload.authenticated === true)
      })
      .catch(() => {
        if (active) setError('Could not verify the admin session.')
      })
      .finally(() => {
        if (active) setChecking(false)
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (authenticated) void loadReport()
  }, [authenticated])

  const totals = report?.totals
  if (checking) return <main className="mx-auto max-w-xl p-10 text-center text-sm text-slate-600">Checking secure admin session…</main>
  if (!authenticated) return <main className="mx-auto grid min-h-[65vh] max-w-xl place-items-center px-4"><section className="w-full rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"><p className="text-xs font-bold uppercase tracking-widest text-orange-600">Trexifly Admin</p><h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Affiliate performance</h1><p className="mt-2 text-sm text-slate-500">Use the existing Trexifly admin login. No separate account is required.</p><Link to="/admin/alerts" className="mt-5 inline-flex rounded-xl bg-[#FF5500] px-5 py-3 text-sm font-bold text-white">Open secure admin login</Link></section></main>

  return <main className="mx-auto min-h-[75vh] max-w-[1280px] px-4 py-8 sm:px-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-widest text-orange-600">Trexifly intelligence workspace</p><h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">Affiliate performance</h1><p className="mt-2 text-sm text-slate-500">Travelpayouts account reporting · confirmed and processing activity.</p></div>
      <div className="flex flex-wrap gap-2"><Link to="/admin/alerts" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold dark:border-slate-600">Alerts &amp; B2B</Link><button onClick={loadReport} disabled={loading} className="rounded-xl bg-[#FF5500] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh report'}</button></div>
    </div>

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">From<input type="date" value={from} max={to} onChange={event => setFrom(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-white"/></label>
        <label className="grid gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">To<input type="date" value={to} min={from} max={new Date().toISOString().slice(0, 10)} onChange={event => setTo(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-white"/></label>
        <button onClick={loadReport} disabled={loading || !from || !to || from > to} className="rounded-lg border border-orange-600 px-4 py-2.5 text-sm font-bold text-orange-700 disabled:opacity-50 dark:text-orange-300">Apply date range</button>
        {report && <span className="text-xs text-slate-500">Report period: {report.from} to {report.to}</span>}
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      {loading && !report && <p className="mt-5 text-sm text-slate-500">Loading Travelpayouts statistics…</p>}
    </section>

    {report && <>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><p className="text-xs font-semibold text-slate-500">Partner redirects</p><p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{count(totals?.redirects ?? 0)}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><p className="text-xs font-semibold text-slate-500">Searches</p><p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{count(totals?.searches ?? 0)}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><p className="text-xs font-semibold text-slate-500">Paid bookings</p><p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{count(totals?.paidBookings ?? 0)}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><p className="text-xs font-semibold text-slate-500">Confirmed earnings (USD)</p><p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{usd(totals?.paidProfitUsd ?? 0)}</p></article>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 p-5 dark:border-slate-700"><div><h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Provider breakdown</h2><p className="mt-1 text-xs text-slate-500">Campaigns detected in the Travelpayouts account. Zero values mean no matching activity in the selected period.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">USD reporting</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-xs"><thead className="bg-slate-50 text-slate-500 dark:bg-slate-800"><tr><th className="p-3">Provider</th><th className="p-3">Category</th><th className="p-3 text-right">Redirects</th><th className="p-3 text-right">Searches</th><th className="p-3 text-right">Paid</th><th className="p-3 text-right">Processing</th><th className="p-3 text-right">Cancelled</th><th className="p-3 text-right">Paid profit</th><th className="p-3 text-right">Processing profit</th></tr></thead><tbody>{report.rows.map(row=><tr key={row.id} className="border-t border-slate-100 text-slate-700 dark:border-slate-700 dark:text-slate-200"><td className="p-3 font-bold text-slate-900 dark:text-white">{row.name}</td><td className="p-3">{row.category}</td><td className="p-3 text-right tabular-nums">{count(row.redirects)}</td><td className="p-3 text-right tabular-nums">{count(row.searches)}</td><td className="p-3 text-right tabular-nums">{count(row.paidBookings)}</td><td className="p-3 text-right tabular-nums">{count(row.processingBookings)}</td><td className="p-3 text-right tabular-nums">{count(row.cancelledBookings)}</td><td className="p-3 text-right font-bold tabular-nums">{usd(row.paidProfitUsd)}</td><td className="p-3 text-right tabular-nums">{usd(row.processingProfitUsd)}</td></tr>)}</tbody></table></div>
      </section>
      <p className="mt-4 text-xs leading-5 text-slate-500">Paid profit is the confirmed amount reported by Travelpayouts, not an estimated commission. Processing profit is pending and may change. Travelpayouts data may be delayed; final payout balance remains subject to its account dashboard and programme terms.</p>
    </>}
  </main>
}
