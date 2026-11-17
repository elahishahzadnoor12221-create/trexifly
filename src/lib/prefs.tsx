import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export const CURRENCY_OPTIONS = [
  { code: 'ARS', name: 'Argentine Peso' }, { code: 'AUD', name: 'Australian Dollar' },
  { code: 'AZN', name: 'Azerbaijani Manat' }, { code: 'BHD', name: 'Bahraini Dinar' },
  { code: 'BRL', name: 'Brazilian Real' }, { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CLP', name: 'Chilean Peso' }, { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'COP', name: 'Colombian Peso' }, { code: 'CZK', name: 'Czech Koruna' },
  { code: 'DKK', name: 'Danish Krone' }, { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'EUR', name: 'Euro' }, { code: 'FJD', name: 'Fijian Dollar' },
  { code: 'GEL', name: 'Georgian Lari' }, { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'HUF', name: 'Hungarian Forint' }, { code: 'ISK', name: 'Icelandic Króna' },
  { code: 'INR', name: 'Indian Rupee' }, { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'ILS', name: 'Israeli New Shekel' }, { code: 'JPY', name: 'Japanese Yen' },
  { code: 'JOD', name: 'Jordanian Dinar' }, { code: 'KZT', name: 'Kazakhstani Tenge' },
  { code: 'KWD', name: 'Kuwaiti Dinar' }, { code: 'MOP', name: 'Macanese Pataca' },
  { code: 'MYR', name: 'Malaysian Ringgit' }, { code: 'MXN', name: 'Mexican Peso' },
  { code: 'MDL', name: 'Moldovan Leu' }, { code: 'NAD', name: 'Namibian Dollar' },
  { code: 'TWD', name: 'New Taiwan Dollar' }, { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'NOK', name: 'Norwegian Krone' }, { code: 'OMR', name: 'Omani Rial' },
  { code: 'PKR', name: 'Pakistani Rupee' }, { code: 'PLN', name: 'Polish Złoty' },
  { code: 'GBP', name: 'Pound Sterling' }, { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'RON', name: 'Romanian Leu' }, { code: 'RUB', name: 'Russian Ruble' },
  { code: 'SAR', name: 'Saudi Arabian Riyal' }, { code: 'SGD', name: 'Singaporean Dollar' },
  { code: 'ZAR', name: 'South African Rand' }, { code: 'KRW', name: 'South Korean Won' },
  { code: 'SEK', name: 'Swedish Krona' }, { code: 'CHF', name: 'Swiss Franc' },
  { code: 'THB', name: 'Thai Baht' }, { code: 'TRY', name: 'Turkish Lira' },
  { code: 'USD', name: 'U.S. Dollar' }, { code: 'UAH', name: 'Ukrainian Hryvnia' },
  { code: 'AED', name: 'United Arab Emirates Dirham' }, { code: 'XOF', name: 'West African CFA Franc' },
] as const

export const CURRENCIES = CURRENCY_OPTIONS.map((item) => item.code)
export type Currency = (typeof CURRENCY_OPTIONS)[number]['code']
export const SUGGESTED_CURRENCIES: Currency[] = ['PKR', 'USD', 'EUR', 'GBP']
export const CURRENCY_NAME = Object.fromEntries(CURRENCY_OPTIONS.map(({ code, name }) => [code, name])) as Record<Currency, string>

const FALLBACK_RATES: Partial<Record<Currency, number>> = { USD: 1, PKR: 278.5, EUR: 0.92, GBP: 0.79 }
const FX_CACHE_KEY = 'trexifly.fx.usd.v1'
const FX_CACHE_TTL = 12 * 60 * 60 * 1000

export const LANGUAGES = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'ur', label: 'اردو', short: 'UR' },
  { id: 'ar', label: 'العربية', short: 'AR' },
] as const
export type Lang = (typeof LANGUAGES)[number]['id']

const STRINGS: Record<Lang, Record<string, string>> = {
  en: { flights: 'Flights', hotels: 'Hotels', cars: 'Car Rentals', tours: 'Tours', deals: 'Deals', compare: 'Compare Cheapest Deals', explore: 'Explore' },
  ur: { flights: 'فلائٹس', hotels: 'ہوٹلز', cars: 'کار کرایہ', tours: 'ٹورز', deals: 'ڈیلز', compare: 'سستے ترین ڈیلز', explore: 'دریافت کریں' },
  ar: { flights: 'الرحلات', hotels: 'الفنادق', cars: 'تأجير السيارات', tours: 'الجولات', deals: 'العروض', compare: 'قارن أرخص العروض', explore: 'استكشف' },
}

type FxRates = Partial<Record<Currency, number>>
type Prefs = {
  currency: Currency; setCurrency: (currency: Currency) => void
  lang: Lang; setLang: (lang: Lang) => void
  t: (key: string) => string; money: (usd: number) => string; symbol: string
  fxStatus: 'loading' | 'live' | 'cached' | 'fallback'; fxUpdatedAt: number | null
}
const PrefsContext = createContext<Prefs | null>(null)

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return allowed.includes(value as T) ? (value as T) : fallback
  } catch { return fallback }
}
function store(key: string, value: string) {
  try { window.localStorage.setItem(key, value) } catch { /* Storage may be unavailable. */ }
}
function readFxCache(): { rates: FxRates; updatedAt: number } | null {
  try {
    const raw = window.localStorage.getItem(FX_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { rates?: FxRates; updatedAt?: number }
    if (!parsed.rates || !parsed.updatedAt || Date.now() - parsed.updatedAt > FX_CACHE_TTL) return null
    return { rates: parsed.rates, updatedAt: parsed.updatedAt }
  } catch { return null }
}
function currencySymbol(code: Currency) {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
      .formatToParts(1).find((part) => part.type === 'currency')?.value ?? code
  } catch { return code }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => readStored('trexifly.currency', CURRENCIES, 'USD'))
  const [lang, setLangState] = useState<Lang>(() => readStored('trexifly.lang', ['en', 'ur', 'ar'], 'en'))
  const [rates, setRates] = useState<FxRates>(() => ({ ...FALLBACK_RATES, ...(readFxCache()?.rates ?? {}) }))
  const [fxStatus, setFxStatus] = useState<Prefs['fxStatus']>(() => readFxCache() ? 'cached' : 'loading')
  const [fxUpdatedAt, setFxUpdatedAt] = useState<number | null>(() => readFxCache()?.updatedAt ?? null)

  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => {
    const cached = readFxCache()
    if (cached) {
      setRates({ ...FALLBACK_RATES, ...cached.rates })
      setFxStatus('cached')
      setFxUpdatedAt(cached.updatedAt)
    }
    const controller = new AbortController()
    fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('FX service unavailable')
        return response.json() as Promise<{ result?: string; rates?: Record<string, number>; time_last_update_unix?: number }>
      })
      .then((data) => {
        if (data.result !== 'success' || !data.rates) throw new Error('Invalid FX response')
        const next = Object.fromEntries(CURRENCIES.flatMap((code) => {
          const rate = data.rates?.[code]
          return typeof rate === 'number' && Number.isFinite(rate) && rate > 0 ? [[code, rate]] : []
        })) as FxRates
        const updatedAt = (data.time_last_update_unix ?? Math.floor(Date.now() / 1000)) * 1000
        setRates({ ...FALLBACK_RATES, ...next })
        setFxStatus('live')
        setFxUpdatedAt(updatedAt)
        store(FX_CACHE_KEY, JSON.stringify({ rates: next, updatedAt }))
      })
      .catch(() => {
        if (!controller.signal.aborted) setFxStatus(cached ? 'cached' : 'fallback')
      })
    return () => controller.abort()
  }, [])

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next)
    store('trexifly.currency', next)
  }, [])
  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    store('trexifly.lang', next)
  }, [])
  const t = useCallback((key: string) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key, [lang])
  const money = useCallback((usd: number) => {
    const rate = rates[currency]
    if (typeof rate !== 'number') {
      return 'USD ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usd)
    }
    const digits = ['BHD', 'JOD', 'KWD', 'OMR'].includes(currency) ? 3 : ['JPY', 'KRW', 'CLP', 'ISK', 'HUF'].includes(currency) ? 0 : 2
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(usd * rate)
  }, [currency, rates])

  const value = useMemo<Prefs>(() => ({
    currency, setCurrency, lang, setLang, t, money,
    symbol: currencySymbol(currency), fxStatus, fxUpdatedAt,
  }), [currency, setCurrency, lang, setLang, t, money, fxStatus, fxUpdatedAt])

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePrefs(): Prefs {
  const value = useContext(PrefsContext)
  if (!value) throw new Error('usePrefs must be used inside <PrefsProvider>')
  return value
}