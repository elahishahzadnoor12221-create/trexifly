import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'

import { cx } from '../lib/cx'
import { CURRENCY_OPTIONS, SUGGESTED_CURRENCIES, LANGUAGES, usePrefs, type Currency } from '../lib/prefs'
import { Icon, type IconName } from './Icons'

type NavItem = { key: string; to: string; icon: IconName; short: string }

const NAV: NavItem[] = [
  { key: 'hotels', to: '/?tab=hotels#search-widget', icon: 'bed', short: 'Stays' },
  { key: 'flights', to: '/?tab=flights#search-widget', icon: 'plane', short: 'Flights' },
  { key: 'cars', to: '/?tab=cars#search-widget', icon: 'car', short: 'Car Rental' },
  { key: 'tours', to: '/?tab=tours#search-widget', icon: 'compass', short: 'Activities' },
  { key: 'transfers', to: '/?tab=transfers#search-widget', icon: 'car', short: 'Airport Transfers' },
]

export function Logo({ className }: { className?: string }) {
  return <Link to="/" aria-label="Trexifly home" className={cx('flex shrink-0 items-center', className)}>
    <img
      src="/trexifly-logo.png"
      alt="Trexifly — Worldwide travel discovery"
      className="trexifly-logo-light h-8 w-auto object-contain sm:h-12 md:h-14"
      width={500}
      height={140}
    />
    <img
      src="/trexifly-logo-dark.png"
      alt=""
      aria-hidden="true"
      className="trexifly-logo-dark h-8 w-auto object-contain sm:h-12 md:h-14"
      width={500}
      height={140}
    />
  </Link>
}

function PrefsMenu() {
  const { currency, setCurrency, lang, setLang, symbol, fxStatus, fxUpdatedAt } = usePrefs()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const short = LANGUAGES.find((language) => language.id === lang)?.short ?? 'EN'
  const filteredCurrencies = useMemo(() => CURRENCY_OPTIONS.filter((item) =>
    item.name.toLowerCase().includes(query.trim().toLowerCase()) ||
    item.code.toLowerCase().includes(query.trim().toLowerCase())
  ), [query])
  const chooseCurrency = (code: Currency) => {
    setCurrency(code)
    setOpen(false)
    setQuery('')
  }
  const suggested = SUGGESTED_CURRENCIES.map((code) => CURRENCY_OPTIONS.find((item) => item.code === code)!).filter(Boolean)
  const fxMessage = fxStatus === 'live'
    ? 'Exchange rates updated from a live reference feed.'
    : fxStatus === 'cached'
      ? 'Using recently cached exchange rates.'
      : fxStatus === 'loading'
        ? 'Loading current reference exchange rates…'
        : 'Live rates are unavailable. Fallback reference rates are estimates; your booking partner sets the final charge currency and amount.'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-2.5 py-1.5 text-[11.5px] font-semibold text-[#262626] transition hover:border-[#F36B16] hover:bg-orange-50 sm:px-3"
      >
        <span className="text-[#FFB800]">{symbol}</span>
        <span>{currency}</span>
        <span className="text-slate-400">·</span>
        <span className="hidden text-slate-500 sm:inline">{short}</span>
        <Icon name="chevronDown" className={cx('size-3.5 text-faint transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Select your currency and language"
          className="glass absolute right-0 top-[calc(100%+10px)] z-50 w-[min(23rem,calc(100vw-1.5rem))] animate-fade rounded-card p-4 shadow-2xl sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-ink">Select your currency</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                Where applicable, prices will be converted to—and shown in—the currency you select. The currency you pay in may differ based on your reservation, and a service fee may also apply.
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close currency selector" className="rounded-full p-1.5 text-muted hover:bg-white/10 hover:text-ink">
              <Icon name="close" className="size-4" />
            </button>
          </div>

          <label className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-rose">
            <Icon name="search" className="size-4 shrink-0 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search currency or code"
              aria-label="Search currency or code"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="mt-4 max-h-[min(56vh,26rem)] space-y-4 overflow-y-auto pr-1">
            {!query.trim() && (
              <section>
                <p className="eyebrow text-faint">Suggested for you</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {suggested.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => chooseCurrency(option.code)}
                      aria-pressed={option.code === currency}
                      className={cx(
                        'flex min-h-[58px] items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition',
                        option.code === currency ? 'border-[#FFB800] bg-amber-50' : 'border-slate-200 bg-white hover:border-amber-400',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-slate-900">{option.name}</span>
                        <span className="mt-0.5 block text-[10px] text-slate-500">{option.code}</span>
                      </span>
                      {option.code === currency && <Icon name="check" className="size-4 shrink-0 text-amber-600" />}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <p className="eyebrow text-faint">{query.trim() ? 'Search results' : 'All currencies'}</p>
              <div className="mt-2 divide-y divide-slate-100">
                {filteredCurrencies.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => chooseCurrency(option.code)}
                    aria-pressed={option.code === currency}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-left transition hover:bg-slate-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-800">{option.name}</span>
                      <span className="block text-[10px] tracking-wide text-slate-500">{option.code}</span>
                    </span>
                    {option.code === currency
                      ? <Icon name="check" className="size-4 shrink-0 text-rose" />
                      : <span className="text-xs text-slate-400">{new Intl.NumberFormat('en', { style: 'currency', currency: option.code, currencyDisplay: 'narrowSymbol' }).formatToParts(1).find((part) => part.type === 'currency')?.value ?? option.code}</span>}
                  </button>
                ))}
                {filteredCurrencies.length === 0 && <p className="px-2.5 py-5 text-center text-sm text-slate-500">No matching currency found.</p>}
              </div>
            </section>

            {!query.trim() && (
              <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700">Property's currency</span>
                  <span className="text-sm font-semibold text-slate-500">€ $ £</span>
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                  Original property currency will be shown when the booking partner provides it.
                </p>
              </section>
            )}
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            <p className="eyebrow text-faint">Language</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {LANGUAGES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setLang(option.id)}
                  aria-pressed={option.id === lang}
                  className={cx(
                    'rounded-lg border px-2 py-2 text-xs transition',
                    option.id === lang ? 'border-[#FFB800] bg-amber-50 font-semibold text-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-slate-500">Only selected interface labels are translated. Some pages and partner content remain in English.</p>
            <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
              {fxMessage}{fxUpdatedAt ? ' Last update: ' + new Date(fxUpdatedAt).toLocaleString() + '.' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
export function Header() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const [notice, setNotice] = useState('')
  const [authMode, setAuthMode] = useState<'signin'|'register'|null>(null)




  useEffect(() => { const openAccount = () => setAuthMode('signin'); window.addEventListener('trexifly:open-account', openAccount); return () => window.removeEventListener('trexifly:open-account', openAccount) }, [])
  const { theme, setTheme } = usePrefs()
  const activeTab = params.get('tab') ?? (params.get('service') === 'airport-transfer' ? 'transfers' : params.get('type') === 'hotels' ? 'hotels' : params.get('type') === 'cars' ? 'cars' : params.get('type') === 'tours' ? 'tours' : 'hotels')
  const isActive = (key: string) => pathname === '/' ? activeTab === key : (params.get('type') === key || (key === 'transfers' && params.get('service') === 'airport-transfer'))
  return (
    <header className="site-header relative z-50 border-b border-slate-200 bg-[#FFFFFF] text-slate-900">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 2xl:max-w-[1600px]">
        <div className="flex min-h-[80px] items-center justify-between gap-4 xl:gap-6">
          <Logo />
                  <nav aria-label="Travel categories" className="hidden min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap 2xl:flex">
          {NAV.map(item => <Link key={item.key} to={item.to} aria-current={isActive(item.key) ? 'page' : undefined} className={cx('inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2.5 text-sm font-semibold transition', isActive(item.key) ? 'border-[#FF5500] bg-[#FF5500] text-white shadow-[0_5px_16px_rgba(255,85,0,.18)]' : 'border-transparent text-slate-700 hover:border-orange-200 hover:bg-orange-50')}><Icon name={item.icon} className={cx('size-4', isActive(item.key) ? 'text-white' : 'text-[#FF5500]')} />{item.short}</Link>)}
        </nav>
          <div className="flex shrink-0 items-center gap-1 whitespace-nowrap sm:gap-3">
            <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'dark'} className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#FF5500] hover:text-[#FF5500]" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}><span aria-hidden="true" className="text-base leading-none">{theme === 'dark' ? '☀' : '☾'}</span></button>
            <PrefsMenu />
            <Link to="/my-trips" className="hidden rounded-lg border border-orange-200 px-3 py-2 text-sm font-semibold text-[#B93800] hover:bg-orange-50 sm:inline-flex">My Trips</Link>
            <button onClick={() => setAuthMode('register')} className="hidden rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-orange-50 sm:inline-flex">Register (coming soon)</button>
            <button onClick={() => setAuthMode('signin')} className="rounded-lg bg-[#FF5500] px-2 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#E64A00] sm:px-3">Account</button>
          </div>
        </div>
                <nav aria-label="Travel categories" className="no-scrollbar flex gap-2 overflow-x-auto pb-3 2xl:hidden">
          {NAV.map(item => <Link key={item.key} to={item.to} aria-current={isActive(item.key) ? 'page' : undefined} className={cx('inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2.5 text-sm font-semibold transition', isActive(item.key) ? 'border-[#FF5500] bg-[#FF5500] text-white shadow-[0_5px_16px_rgba(255,85,0,.18)]' : 'border-transparent text-slate-700 hover:border-orange-200 hover:bg-orange-50')}><Icon name={item.icon} className={cx('size-4', isActive(item.key) ? 'text-white' : 'text-[#FF5500]')} />{item.short}</Link>)}
          <Link to="/my-trips" className="inline-flex shrink-0 items-center rounded-full border border-orange-200 px-3.5 py-2.5 text-sm font-semibold text-[#B93800]">My Trips</Link>
        </nav>
      </div>
      {notice && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4" onClick={() => setNotice('')}><div className="max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}><h2 className="text-lg font-bold">Trexifly</h2><p className="mt-2 text-sm leading-6 text-slate-600">{notice}</p><button onClick={() => setNotice('')} className="mt-5 rounded-lg bg-[#FF5500] px-5 py-2.5 text-sm font-bold text-white">Close</button></div></div>}
      {authMode && <div role="dialog" aria-modal="true" aria-labelledby="trexifly-auth-title" className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm" onClick={()=>setAuthMode(null)}>
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_30px_90px_rgba(80,25,0,.35)]" onClick={e=>e.stopPropagation()}>
          <div className="bg-gradient-to-br from-[#FF5500] via-[#E64A00] to-[#B93600] p-6 text-white"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-100">Trexifly account</p><h2 id="trexifly-auth-title" className="mt-1 text-2xl font-extrabold">Account access is not available yet</h2></div><button type="button" onClick={()=>setAuthMode(null)} aria-label="Close" className="rounded-full bg-white/15 p-2 text-white">×</button></div><p className="mt-2 text-sm text-orange-50">Use My Trips to save itineraries in this browser while account services are being built.</p></div>
          <div className="p-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-950">Sign-in and registration are not connected yet.</p>
              <p className="mt-2 text-xs leading-5 text-amber-900">Do not enter a password here. This panel does not create or authenticate accounts. Saved trips remain on this browser only.</p>
            </div>
            <Link to="/my-trips" onClick={() => setAuthMode(null)} className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#FF5500] px-4 py-3 text-sm font-bold text-white hover:bg-[#E64A00]">Open My Trips</Link>
            <button type="button" onClick={() => setAuthMode(null)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
          </div>
        </div>
      </div>}
    </header>
  )
}

export function MobileTabBar() { return null }

export function Footer() {
  const { currency } = usePrefs()

  return (
    <footer id="help" className="mt-16 border-t border-gray-200 bg-white pb-28 text-gray-700 md:pb-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-600">
            Compare flight fare estimates and explore partner options for stays, car rentals, tours and airport transfers.
          </p>

        </div>

        <div>
          <h3 className="mb-3 font-semibold text-gray-900">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="transition hover:text-[#FF5500]">Home</Link></li>
            <li><Link to="/?tab=hotels#search-widget" className="transition hover:text-[#FF5500]">Stays</Link></li>
            <li><Link to="/?tab=flights#search-widget" className="transition hover:text-[#FF5500]">Flights</Link></li>
            <li><Link to="/?tab=cars#search-widget" className="transition hover:text-[#FF5500]">Car Rental</Link></li>
            <li><Link to="/?tab=tours#search-widget" className="transition hover:text-[#FF5500]">Activities</Link></li>
            <li><Link to="/?tab=transfers#search-widget" className="transition hover:text-[#FF5500]">Airport Transfers</Link></li>
            <li><Link to="/my-trips" className="transition hover:text-[#FF5500]">My Trips / Booking Tracker</Link></li>
            <li><button type="button" onClick={() => window.dispatchEvent(new CustomEvent("trexifly:open-account"))} className="transition hover:text-[#FF5500]">Account</button></li>
            <li><Link to="/guides" className="transition hover:text-[#FF5500]">Travel Guides</Link></li>
            <li><Link to="/about" className="transition hover:text-[#FF5500]">About Us</Link></li>
            <li><Link to="/contact" className="transition hover:text-[#FF5500]">Contact Support</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-gray-900">Legal &amp; Policies</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy" className="transition hover:text-[#FF5500]">Privacy Policy</Link></li>
            <li><Link to="/terms" className="transition hover:text-[#FF5500]">Terms &amp; Conditions</Link></li>
            <li><Link to="/affiliate-disclosure" className="transition hover:text-[#FF5500]">Affiliate Disclosure</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-gray-900">Need Help?</h3>
          <p className="mb-2 text-sm text-gray-600">Northern Pakistan trip-planning assistance and travel support:</p>
          <a
            href="https://wa.me/923244921494?text=Hello%20Trexifly%2C%20I%20would%20like%20travel%20planning%20assistance."
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Trexifly on WhatsApp" title="Chat on WhatsApp" className="inline-flex size-11 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:bg-[#1DA851] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          >
            <Icon name="whatsapp" className="size-5" />
          </a>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">Message us to discuss custom itinerary assistance, group travel or general enquiries.</p>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-4 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Trexifly. All rights reserved. We may earn a commission when you book through our partner links at no extra cost to you.</p>
        <p className="mt-1">Prices shown in {currency} may be indicative; confirm availability, taxes and final prices with the booking partner.</p>
      </div>
    </footer>
  )
}
