import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
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
      alt="Trexifly â€” Worldwide travel discovery"
      className="h-11 w-[158px] rounded-lg bg-white px-1.5 py-1 object-contain shadow-md"
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
        ? 'Loading current reference exchange ratesâ€¦'
        : 'Live rates are unavailable. Supported fallback rates are shown; other currencies remain in USD.'

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
        <span className="text-slate-400">Â·</span>
        <span className="text-slate-500">{short}</span>
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
                Where applicable, prices will be converted toâ€”and shown inâ€”the currency you select. The currency you pay in may differ based on your reservation, and a service fee may also apply.
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
                  <span className="text-sm font-semibold text-slate-500">â‚¬ $ Â£</span>
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
  const [authMessage, setAuthMessage] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authName, setAuthName] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const activeTab = params.get('tab') ?? (params.get('service') === 'airport-transfer' ? 'transfers' : params.get('type') === 'hotels' ? 'hotels' : params.get('type') === 'cars' ? 'cars' : params.get('type') === 'tours' ? 'tours' : 'hotels')
  const isActive = (key: string) => pathname === '/' ? activeTab === key : (params.get('type') === key || (key === 'transfers' && params.get('service') === 'airport-transfer'))
  return (
    <header className="site-header relative z-50 border-b border-[#B93600] bg-[#B93600] text-white shadow-[0_4px_18px_rgba(0,25,80,.22)]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex min-h-[72px] items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-4">
            <PrefsMenu />
            <a href="#help" className="hidden rounded-lg px-2 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-[#FFB800] sm:inline-flex">Help <span className="ml-1">?</span></a>
            <button onClick={() => setNotice('Property partner listings are not available yet. Contact Trexifly to discuss a listing integration.')} className="hidden text-sm font-semibold text-white/90 hover:text-[#FFB800] md:inline-flex">List your property</button>
            <button onClick={() => {setAuthMode('register');setAuthMessage('')}} className="rounded-lg border border-white/70 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">Register</button>
            <button onClick={() => {setAuthMode('signin');setAuthMessage('')}} className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#D94700] shadow-sm hover:bg-orange-50">Sign in</button>
          </div>
        </div>
        <nav aria-label="Travel categories" className="no-scrollbar flex gap-2 overflow-x-auto pb-4">
          {NAV.map(item => <Link key={item.key} to={item.to} aria-current={isActive(item.key) ? 'page' : undefined} className={cx('inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition', isActive(item.key) ? 'border-white bg-white/15 text-white shadow-[0_5px_16px_rgba(0,0,0,.12)]' : 'border-transparent text-slate-700 hover:border-orange-200 hover:bg-orange-50')}><Icon name={item.icon} className={cx('size-4', isActive(item.key) ? 'text-[#D94C0B]' : 'text-[#FFB800]')} />{item.short}</Link>)}
        </nav>
      </div>
      {notice && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-4" onClick={() => setNotice('')}><div className="max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}><h2 className="text-lg font-bold">Trexifly</h2><p className="mt-2 text-sm leading-6 text-slate-600">{notice}</p><button onClick={() => setNotice('')} className="mt-5 rounded-lg bg-[#FF5500] px-5 py-2.5 text-sm font-bold text-white">Close</button></div></div>}
      {authMode && <div role="dialog" aria-modal="true" aria-labelledby="trexifly-auth-title" className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm" onClick={()=>setAuthMode(null)}>
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_30px_90px_rgba(80,25,0,.35)]" onClick={e=>e.stopPropagation()}>
          <div className="bg-gradient-to-br from-[#FF5500] via-[#E64A00] to-[#B93600] p-6 text-white"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-100">Trexifly account</p><h2 id="trexifly-auth-title" className="mt-1 text-2xl font-extrabold">{authMode==='register'?'Create your account':'Welcome back'}</h2></div><button type="button" onClick={()=>setAuthMode(null)} aria-label="Close" className="rounded-full bg-white/15 p-2 text-white">Ã—</button></div><p className="mt-2 text-sm text-orange-50">Save destinations and make travel planning easier.</p></div>
          <div className="p-6"><div className="mb-5 grid grid-cols-2 rounded-xl bg-orange-50 p-1"><button type="button" onClick={()=>{setAuthMode('signin');setAuthMessage('')}} className={`rounded-lg py-2 text-sm font-bold ${authMode==='signin'?'bg-white text-[#D94700] shadow':'text-slate-500'}`}>Sign in</button><button type="button" onClick={()=>{setAuthMode('register');setAuthMessage('')}} className={`rounded-lg py-2 text-sm font-bold ${authMode==='register'?'bg-white text-[#D94700] shadow':'text-slate-500'}`}>Register</button></div>
            <form onSubmit={(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();setAuthMessage('Your details passed browser validation. Secure account sign-in/registration is not connected yet; no password has been saved.')}} className="space-y-3">
              {authMode==='register'&&<label className="block text-xs font-semibold text-slate-600">Full name<input required minLength={2} value={authName} onChange={e=>setAuthName(e.target.value)} autoComplete="name" className="mt-1 w-full rounded-xl border border-orange-100 px-3 py-3 text-sm text-slate-900 outline-none focus:border-[#FF5500]" placeholder="Your name"/></label>}
              <label className="block text-xs font-semibold text-slate-600">Email address<input required type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} autoComplete="email" className="mt-1 w-full rounded-xl border border-orange-100 px-3 py-3 text-sm text-slate-900 outline-none focus:border-[#FF5500]" placeholder="you@example.com"/></label>
              <label className="block text-xs font-semibold text-slate-600">Password<input required minLength={8} type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} autoComplete={authMode==='register'?'new-password':'current-password'} className="mt-1 w-full rounded-xl border border-orange-100 px-3 py-3 text-sm text-slate-900 outline-none focus:border-[#FF5500]" placeholder="At least 8 characters"/></label>
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-[#FF5500] to-[#D94700] py-3 text-sm font-bold text-white shadow-lg shadow-orange-200">{authMode==='register'?'Create account':'Sign in'}</button>
            </form>
            {authMessage&&<p role="status" className="mt-4 rounded-xl bg-orange-50 p-3 text-xs leading-5 text-[#9A3412]">{authMessage}</p>}
            <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">Secure account service is not configured. This form does not create or authenticate accounts yet.</p>
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
    <footer id="help" className="relative mt-0 border-t border-slate-200 bg-white pb-28 pt-12 md:pb-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(47,216,160,0.08),transparent)]"
      />
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 sm:px-6 md:grid-cols-[1.2fr_1fr_1.2fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Metasearch for flights, stays, cars and adventures. One search, every price, no booking fees.
          </p>
        </div>

        <div>
          <p className="eyebrow text-faint">Compare</p>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV.map((item) => (
              <li key={item.key}>
                <Link to={item.to} className="text-muted transition hover:text-ink">
                  {item.short}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-faint">Company &amp; support</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/about" className="text-muted hover:text-[#FF5500]">About Trexifly</Link></li>
            <li><Link to="/contact" className="text-muted hover:text-[#FF5500]">Contact us</Link></li>
            <li><Link to="/guides" className="text-muted hover:text-[#FF5500]">Travel guides</Link></li>
            <li><Link to="/privacy" className="text-muted hover:text-[#FF5500]">Privacy policy</Link></li>
            <li><Link to="/terms" className="text-muted hover:text-[#FF5500]">Terms &amp; conditions</Link></li>
            <li><Link to="/affiliate-disclosure" className="text-muted hover:text-[#FF5500]">Affiliate disclosure</Link></li>
            <li><a href="https://wa.me/923244921494" target="_blank" rel="noreferrer" className="font-semibold text-[#FF5500]">WhatsApp +92 324 4921494</a></li>
          </ul>
          <p className="eyebrow mt-5 text-faint">Good to know</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Prices are indicative in {currency} until confirmed by the booking partner.</li>
            <li>Trexifly never charges a booking fee.</li>
            <li>We may earn a commission when you book with a partner.</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-[1280px] flex-col gap-2 border-t border-white/10 px-4 pt-5 text-[11px] text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Â© {new Date().getFullYear()} Trexifly. All rights reserved.</p>
        <p>Affiliate-ready metasearch Â· Flights, stays, cars and tours.</p>
      </div>
    </footer>
  )
}
