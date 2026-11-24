import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Icon } from '../components/Icons'
import { SearchWidget } from '../components/SearchWidget'
import { readQuery, dealsFor, PLACES, type Deal, type SearchQuery } from '../lib/data'
import { generateHotelInventory, type HotelListing } from '../lib/hotels'
import { buildAffiliateUrl, getAffiliatePartners } from '../lib/affiliates'
import { buildHotelProviderLinks } from '../lib/hotelLinks'
import { recordPartnerCheckout, saveTrip, type TripCategory } from '../lib/trips'
import { usePrefs } from '../lib/prefs'
import { imgFallback } from '../lib/imageFallback'


function HotelCard({ hotel, query }: { hotel: HotelListing; query: SearchQuery }) {
  const { money } = usePrefs()
  const [saved, setSaved] = useState(false)
  const links = buildHotelProviderLinks(query)
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-xl bg-orange-50 md:h-auto md:w-60 dark:bg-slate-800">
          <img src={hotel.photoUrl} alt={hotel.title + ' property photo in ' + query.to} loading="lazy" onError={imgFallback} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
          <button type="button" onClick={() => setSaved(!saved)} aria-label="Save property" className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm">
            <svg aria-hidden="true" viewBox="0 0 24 24" className={"size-4 transition-colors " + (saved ? "fill-[#FF5500] stroke-[#FF5500]" : "fill-none stroke-slate-600")} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{hotel.title}</h3>
              <span className="text-xs font-bold text-amber-500">{hotel.stars}★</span>
              <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#C93400] dark:bg-orange-950/40 dark:text-orange-300">Trexifly Partner Rates</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-[#FF5500]">{query.to} · <span className="font-normal text-slate-500">{hotel.neighborhood}</span></p>
            <p className="mt-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">{hotel.address}</p>
            <div className="mt-2 space-y-1 text-xs">
              <p className="font-semibold text-slate-600 dark:text-slate-300">{hotel.subtitle}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {hotel.perks.map(perk => <span key={perk} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{perk}</span>)}
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/70">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Hotel booking partners</p>
              <span className="text-[10px] font-semibold text-slate-500">Partner rates</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {links.length ? links.map(link => <a key={link.id} href={link.url} onClick={() => recordPartnerCheckout({ title: hotel.title, category: 'hotels', origin: '', destination: query.to, departureDate: query.out, returnDate: query.back, partner: link.name, partnerUrl: link.url })} target="_blank" rel="noopener noreferrer sponsored" data-provider-id={link.id} data-affiliate-status={link.tracking} className="hotel-provider-link inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-700 bg-[#172033] px-2 py-2 text-center text-[11px] font-bold text-white transition hover:border-[#FF5500] hover:bg-[#26364F] dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:border-orange-400">
                Search {link.name} ↗
              </a>) : <p className="col-span-2 rounded-lg bg-slate-100 px-3 py-3 text-center text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">Hotel partner links are temporarily unavailable while tracking is re-verified.</p>}
            </div>
            <p className="mt-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400">Unverified hotel booking buttons remain hidden until their affiliate redirects pass a clean check.</p>
          </div>
        </div>
        <div className="flex flex-row items-end justify-between border-t border-slate-100 pt-3 md:w-48 md:shrink-0 md:flex-col md:border-l md:border-t-0 md:pl-4 md:pt-0 dark:border-slate-700">

          <div className="text-right">
            <p className="text-[11px] text-slate-500">{hotel.priceUnit}</p>
            <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{money(hotel.price)}</p>
            <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">Partner rate guide</p>
          </div>
        </div>
      </div>
    </article>
  )
}

type SortMode = 'Best' | 'Cheapest' | 'Fastest' | 'Earliest Departure'
const AIRLINE_CODES: Record<string, string> = {
  'Pakistan International Airlines':'PK','PIA':'PK','Airblue':'PA','SereneAir':'ER','Fly Jinnah':'9P','AirSial':'PF',
  'Emirates':'EK','Qatar Airways':'QR','Etihad Airways':'EY','Saudia':'SV','Flynas':'XY','Flyadeal':'F3','flydubai':'FZ','Air Arabia':'G9',
  'Turkish Airlines':'TK','Pegasus Airlines':'PC','British Airways':'BA','Virgin Atlantic':'VS','Lufthansa':'LH','SWISS':'LX','Air France':'AF','KLM':'KL','Iberia':'IB',
  'Air Canada':'AC','United Airlines':'UA','Delta Air Lines':'DL','American Airlines':'AA','Singapore Airlines':'SQ','Malaysia Airlines':'MH','Thai Airways':'TG','Cathay Pacific':'CX','ANA':'NH','Japan Airlines':'JL',
  'Gulf Air':'GF','Oman Air':'WY','Kuwait Airways':'KU','Azerbaijan Airlines':'J2','EgyptAir':'MS','Ethiopian Airlines':'ET','Qantas':'QF'
}
function airlineName(deal: Deal) { return deal.airline ?? deal.title.split(' | ')[0] }
function AirlineLogo({ name, size='size-10' }: { name: string; size?: string }) {
  const [failed,setFailed] = useState(false)
  const code = AIRLINE_CODES[name]
  return <span className={'grid '+size+' shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-sm'}>
    {code && !failed ? <img src={`https://pics.avs.io/64/64/${code}.png`} alt="" loading="lazy" className="max-h-full max-w-full object-contain" onError={()=>setFailed(true)}/> : <span aria-label={name} className="text-xs font-extrabold text-[#D94700]">{name.split(/\s+/).map(v=>v[0]).join('').slice(0,3).toUpperCase()}</span>}
  </span>
}
function queryTitleForTrips(query: SearchQuery, category: TripCategory): string {
  if (category === 'flights') return query.from + ' to ' + query.to
  if (category === 'hotels') return 'Stay in ' + query.to
  if (category === 'cars') return 'Car rental: ' + query.from + ' to ' + query.to
  if (category === 'transfers') return 'Airport transfer: ' + query.from + ' to ' + query.to
  return 'Activities in ' + query.to
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border-t border-slate-200 py-4 dark:border-slate-700"><h3 className="mb-2 text-sm font-bold text-slate-900 dark:text-white">{title}</h3>{children}</section>
}
function OfferCard({ deal }: { deal: Deal }) {
  const { money } = usePrefs()
  return <article className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-md sm:p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <AirlineLogo name={airlineName(deal)} size="size-12"/>
        <div className="min-w-0"><p className="font-bold text-slate-900">{airlineName(deal)}</p><p className="mt-1 text-xs text-slate-600">{deal.subtitle}</p><div className="mt-2 flex flex-wrap gap-2">{deal.perks.map(perk=><span key={perk} className="rounded-full bg-[#FFF7F2] px-2.5 py-1 text-[10px] font-medium text-slate-600">{perk}</span>)}</div></div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:min-w-[190px] sm:justify-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <div className="sm:text-right"><p className="text-[11px] text-slate-500">{deal.priceUnit}</p><p className="text-2xl font-bold tracking-tight text-slate-900">{money(deal.price)}</p><p className="text-[10px] text-slate-500">Indicative estimate</p>{deal.title.includes(" · ") && <p className="mt-1 text-[10px] text-slate-500">Flight number shown on partner site</p>}</div>
        {deal.affiliateUrl ? <a href={deal.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored" data-affiliate-status="verified" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#FF5500] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#E64A00]">View Deal <Icon name="arrowUpRight" className="size-4"/></a> : <span className="text-xs font-semibold text-slate-500">No verified booking partner is currently available.</span>}
      </div>
    </div>
  </article>
}

type FlightApiOffer = {
  id: string; price: number; currency: string; airlineCode: string; flightNumber: string
  departureAt: string; arrivalAt: string | null; stops: number | null; durationMinutes: number | null
  originAirport?: string; destinationAirport?: string; bookingUrl: string; deepLinkReady?: boolean; markerId: string
}
function flightAirportCode(value: string): string {
  const explicit = value.match(/\(([A-Z]{3})\)/i)?.[1]
  if (explicit) return explicit.toUpperCase()
  const normalized = value.toLowerCase()
  return PLACES.find(place => place.code && (normalized.includes(place.city.toLowerCase()) || (!!place.airport && normalized.includes(place.airport.toLowerCase()))))?.code ?? ''
}

const FLIGHT_AIRLINE_NAMES: Record<string,string> = { PK:'Pakistan International Airlines',PA:'Airblue',ER:'SereneAir','9P':'Fly Jinnah',PF:'AirSial',EK:'Emirates',QR:'Qatar Airways',EY:'Etihad Airways',SV:'Saudia',XY:'Flynas',FZ:'flydubai',TK:'Turkish Airlines',BA:'British Airways',LH:'Lufthansa',AF:'Air France',KL:'KLM',AC:'Air Canada',UA:'United Airlines',DL:'Delta Air Lines',AA:'American Airlines',QF:'Qantas',NZ:'Air New Zealand',GF:'Gulf Air',WY:'Oman Air',KU:'Kuwait Airways' }
function durationText(minutes: number) { return Math.floor(minutes / 60) + 'h ' + String(minutes % 60).padStart(2, '0') + 'm' }
function FlightTime({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-400">Not supplied</span>
  const date = new Date(value)
  return <span>{Number.isNaN(date.getTime()) ? 'Not supplied' : date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
}

function airportDisplay(code: string) {
  const place = PLACES.find(item => item.code === code)
  return place ? place.airport + ', ' + place.code : code
}
function LiveFlightsResults({ query, infants }: { query: SearchQuery; infants: number }) {
  const [offers,setOffers] = useState<FlightApiOffer[]>([])
  const [partnerSearchUrl,setPartnerSearchUrl] = useState('')
  const [deepLinkReady,setDeepLinkReady] = useState(false)
  const [flexibleOffers,setFlexibleOffers] = useState<FlightApiOffer[]>([])
  const [status,setStatus] = useState<'loading'|'ready'|'empty'|'error'>('loading')
  const [notice,setNotice] = useState('')
  const [sort,setSort] = useState<'price'|'departure'|'duration'>('price')
  const [calendarPrices,setCalendarPrices] = useState<Array<{date:string;price:number;currency:string}>>([])
  const [calendarNotice,setCalendarNotice] = useState('')
  const origin = flightAirportCode(query.from), destination = flightAirportCode(query.to)
  const oneWay = query.back === query.out
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setStatus('loading'); setNotice(''); setOffers([]); setFlexibleOffers([]); setPartnerSearchUrl(''); setDeepLinkReady(false)
      if (!origin || !destination) { setStatus('error'); setNotice('Select a recognised airport from the suggestions so we can search its IATA code.'); return }
      const params = new URLSearchParams({
        origin, destination, departure_at: query.out, one_way: String(oneWay), currency: 'USD',
        adults: String(query.adults ?? 2), children: String(query.children ?? 0), infants: String(infants),
        trip_class: /business/i.test(query.pax) ? 'C' : /first/i.test(query.pax) ? 'F' : /premium economy|comfort/i.test(query.pax) ? 'W' : 'Y',
      })
      if (!oneWay) params.set('return_at', query.back)
      try {
        const response = await fetch('/api/flights/search?'+params.toString(),{signal:controller.signal,headers:{Accept:'application/json'}})
        const payload = await response.json() as { error?:string; offers?:FlightApiOffer[]; flexibleOffers?:FlightApiOffer[]; cacheWindow?:string; searchUrl?:string; deepLinkReady?:boolean }
        if (!response.ok) throw new Error(payload.error || 'Flight fare search is temporarily unavailable.')
        const rows = Array.isArray(payload.offers) ? payload.offers : []
        const flexible = Array.isArray(payload.flexibleOffers) ? payload.flexibleOffers : []
        setOffers(rows); setFlexibleOffers(flexible); setPartnerSearchUrl(payload.searchUrl ?? ''); setDeepLinkReady(Boolean(payload.deepLinkReady)); setStatus(rows.length?'ready':'empty')
        setNotice('Recent fare estimates only. Live availability and the final ticket price must be confirmed with the booking partner.')
      } catch(error) {
        if(controller.signal.aborted)return
        setStatus('error'); setNotice('We could not load recent fare estimates. Please try again shortly or check live prices with the booking partner.')
      }
    }
    void load()
    return ()=>controller.abort()
  },[origin,destination,query.out,query.back,oneWay,query.adults,query.children,query.pax,infants])
  useEffect(() => {
    const controller = new AbortController()
    async function loadCalendar() {
      if (!origin || !destination) return
      const calendarParams = new URLSearchParams({ origin, destination, month: query.out.slice(0, 7), one_way: String(oneWay), departure_at: query.out, return_at: query.back, currency: 'USD' })
      try {
        const response = await fetch('/api/flights/calendar?' + calendarParams.toString(), { signal: controller.signal, headers: { Accept: 'application/json' } })
        const payload = await response.json() as { prices?: Array<{date:string;price:number;currency:string}>; message?:string }
        if (!response.ok) throw new Error(payload.message || 'Fare calendar is temporarily unavailable.')
        setCalendarPrices(Array.isArray(payload.prices) ? payload.prices : [])
        setCalendarNotice(payload.message || '')
      } catch { if (!controller.signal.aborted) setCalendarNotice('Fare estimates are temporarily unavailable. Please try again shortly.') }
    }
    void loadCalendar()
    return () => controller.abort()
  }, [origin, destination, query.out, query.back, oneWay])
  const searchUrl = partnerSearchUrl || buildAffiliateUrl('flights')
  const trackFlightCheckout = () => recordPartnerCheckout({ title: query.from + ' to ' + query.to, category: 'flights', origin: query.from, destination: query.to, departureDate: query.out, returnDate: query.back, partner: 'Aviasales', partnerUrl: searchUrl })
  const [savedNotice, setSavedNotice] = useState('')
  const saveFlightItinerary = () => { saveTrip({ title: query.from + ' to ' + query.to, category: 'flights', origin: query.from, destination: query.to, departureDate: query.out, returnDate: query.back }); setSavedNotice('Itinerary saved to My Trips on this device.') }
  const sorted = [...offers].sort((a,b)=>sort==='price'?a.price-b.price:sort==='departure'?Date.parse(a.departureAt)-Date.parse(b.departureAt):(a.durationMinutes??Number.MAX_SAFE_INTEGER)-(b.durationMinutes??Number.MAX_SAFE_INTEGER))
  const passengerCount = (query.adults ?? 2) + (query.children ?? 0)
  const currency = (amount:number,code:string)=>new Intl.NumberFormat('en-US',{style:'currency',currency:/^[A-Z]{3}$/.test(code)?code:'USD',maximumFractionDigits:0}).format(amount)
  return <div className="results-page min-h-screen bg-[#FFF7F2] pb-16 pt-8 dark:bg-slate-950"><div className="mx-auto max-w-7xl px-4 sm:px-6">
    <Link to="/" className="text-xs font-semibold text-[#FF5500] hover:underline">Back to search</Link>
    <div className="mb-5 mt-3 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{query.from} to {query.to}</h1><p className="mt-1 text-xs text-slate-600">Trexifly fare estimates are based on recent partner data. They are not live availability or guaranteed ticket prices.</p>{status !== 'loading' && <p className="mt-1 text-xs text-slate-600">{deepLinkReady ? 'Your route, dates, cabin and passenger details will be pre-filled on the booking partner.' : 'The partner link is ready, but you may need to enter your search details again.'}</p>}{savedNotice && <p role="status" className="mt-2 text-xs font-semibold text-emerald-700">{savedNotice}</p>}</div><button type="button" onClick={saveFlightItinerary} className="rounded-lg border border-[#FF5500] bg-white px-4 py-2.5 text-xs font-bold text-[#D94700] hover:bg-orange-50">Save itinerary to My Trips</button></div>
    <div className="mb-6 rounded-xl bg-white p-3 shadow-sm"><SearchWidget initial={query} compact hideCategoryTabs/></div>
    <section aria-label="Fare calendar" className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold text-slate-900 dark:text-white">Fare calendar · {new Date(query.out + 'T00:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'})}</h2><span className="text-[10px] text-slate-500">Lowest recent fare estimate by departure date</span></div>
      {calendarPrices.length ? <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">{calendarPrices.map(item => <div key={item.date} className={'rounded-lg border px-2 py-2 text-center ' + (item.date === query.out ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30' : 'border-slate-100 dark:border-slate-700')}><p className="text-[10px] text-slate-500">{new Date(item.date+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',day:'numeric'})}</p><p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">{currency(item.price * passengerCount,item.currency)}</p></div>)}</div> : <p className="mt-2 text-xs text-slate-500">{calendarNotice || 'Loading fare estimates…'}</p>}
    </section>
    <section className="mb-5 rounded-xl border border-orange-100 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">Recent flight fare estimates</h2><p className="mt-1 text-xs text-slate-500">{origin || '—'} → {destination || '—'} · {query.out}{oneWay ? ' -  One-way' : ' -  Return ' + query.back}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-800">Estimated fares</span></div>
      {status==='ready'&&<div className="mt-4 flex flex-wrap gap-2">{([['price','Cheapest'],['departure','Earliest departure'],['duration','Shortest journey']] as const).map(([value,label])=><button key={value} type="button" onClick={()=>setSort(value)} aria-pressed={sort===value} className={'rounded-lg px-3 py-2 text-xs font-bold '+(sort===value?'bg-[#FF5500] text-white':'bg-orange-50 text-slate-700')}>{label}</button>)}</div>}
    </section>
    {status==='loading'&&<div role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">Checking recent flight fares…</div>}
    {status==='error'&&<div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950"><p className="font-bold">Flight fare data unavailable</p><p className="mt-2">{notice}</p></div>}
    {status==='empty'&&<div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><h2 className="font-bold text-slate-900 dark:text-white">No fare estimate for this date</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No recent fare estimate is available for {query.out}. Check live availability with the booking partner or compare other dates in the same month.</p>{flexibleOffers.length>0&&<section className="mt-5"><h3 className="font-bold text-slate-900 dark:text-white">Flexible dates in {new Date(query.out+'T00:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'})} - Estimated total for {passengerCount} passengers: {currency(flexibleOffers[0].price * passengerCount,flexibleOffers[0].currency)}</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{flexibleOffers.map(offer=>{const date=offer.departureAt.slice(0,10);return <a key={offer.id} href={searchUrl} onClick={trackFlightCheckout} data-affiliate-status="verified" target="_blank" rel="noopener noreferrer sponsored" className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-emerald-400 dark:border-slate-700"><span><strong className="block text-sm text-slate-900 dark:text-white">{new Date(date+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',day:'numeric',month:'short'})}</strong><span className="text-[10px] text-slate-500">{FLIGHT_AIRLINE_NAMES[offer.airlineCode] || 'Airline name not supplied'}</span></span><strong className="text-sm text-emerald-700 dark:text-emerald-300">{currency(offer.price * passengerCount,offer.currency)}</strong></a>})}</div></section>}<a href={searchUrl} onClick={trackFlightCheckout} data-affiliate-status="verified" target="_blank" rel="noopener noreferrer sponsored" className="mt-5 inline-flex rounded-lg bg-[#FF5500] px-4 py-3 text-xs font-bold text-white">{deepLinkReady ? 'Search pre-filled' : 'Continue with partner'} <Icon name="arrowUpRight" className="ml-2 size-4"/></a></div>}
    {status==='ready'&&<div className="space-y-3">{sorted.map(offer=>{
      const carrier = FLIGHT_AIRLINE_NAMES[offer.airlineCode] || 'Airline name not supplied'
      const fromCode = offer.originAirport || origin
      const toCode = offer.destinationAirport || destination
      const departureDate = new Date(offer.departureAt)
      const arrivalDate = offer.arrivalAt ? new Date(offer.arrivalAt) : null
      const dateLabel = (value: Date) => value.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      return <article key={offer.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <AirlineLogo name={carrier} size="size-12"/>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900 dark:text-white">{carrier}</h3></div>
              <p className="mt-1 text-xs text-slate-500">{offer.flightNumber ? 'Flight ' + offer.flightNumber + ' · ' : ''}{offer.stops===null?'Stops not supplied':offer.stops===0?'Non-stop':offer.stops+' stop(s)'}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-200">
                <span><strong>{fromCode}</strong><br/><FlightTime value={offer.departureAt}/></span>
                <span><strong>{toCode}</strong><br/><FlightTime value={offer.arrivalAt}/></span>
                {offer.durationMinutes ? <span className="col-span-2 text-slate-500">{durationText(offer.durationMinutes)} journey</span> : null}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 dark:border-slate-700 sm:min-w-[230px] sm:justify-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <div className="sm:text-right"><p className="text-[10px] text-slate-500">Estimated total for {passengerCount} passengers</p><p className="text-2xl font-black text-slate-900 dark:text-white">{currency(offer.price * passengerCount,offer.currency)}</p><p className="max-w-[190px] text-[10px] text-slate-500">Confirm availability and the final ticket price with the booking partner before paying.</p></div>
            <a href={searchUrl} onClick={trackFlightCheckout} data-affiliate-status="verified" target="_blank" rel="noopener noreferrer sponsored" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#FF5500] px-4 py-3 text-xs font-bold text-white">{deepLinkReady ? 'Search pre-filled' : 'Continue with partner'} <Icon name="arrowUpRight" className="size-4"/></a>
          </div>
        </div>
        <details className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
          <summary className="cursor-pointer list-none text-xs font-bold text-[#D94700] dark:text-orange-300">Flight details <span className="float-right text-slate-400">＋</span></summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <section className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/70">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Route & flight timeline</h4>
              <div className="mt-3 space-y-3 text-xs text-slate-700 dark:text-slate-200">
                <div><strong>{airportDisplay(fromCode)}</strong><p className="mt-1">{dateLabel(departureDate)} · <FlightTime value={offer.departureAt}/></p></div>
                <div className="border-l-2 border-dashed border-orange-300 pl-3">{offer.durationMinutes ? durationText(offer.durationMinutes) : 'Duration not supplied'} · {offer.stops===0?'Non-stop':offer.stops===null?'Stops not supplied':offer.stops+' stop(s)'}</div>
                <div><strong>{airportDisplay(toCode)}</strong><p className="mt-1">{arrivalDate && !Number.isNaN(arrivalDate.getTime()) ? dateLabel(arrivalDate) : 'Arrival date not supplied'} · <FlightTime value={offer.arrivalAt}/></p></div>
                <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-200">Airline: {carrier}</span>
              </div>
            </section>
            <section className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/70">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Baggage & ticket conditions</h4>
              <p className="mt-3 rounded-lg bg-white p-3 text-xs leading-5 text-slate-700 dark:bg-slate-900 dark:text-slate-200">Baggage allowance, refunds and ticket-change rules are not included in this fare estimate. Check the exact conditions for the selected ticket with the airline or booking partner before payment.</p>
            </section>
          </div>
        </details>
      </article>
    })}</div>}
    <p className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4 text-xs leading-5 text-slate-700">{notice||'Prices are based on recent partner fare data. The provider may no longer have the fare; verify schedule, baggage, taxes and availability before booking. Partner booking links include Trexifly tracking automatically.'}</p>
  </div></div>
}


type SampleKind = 'cars' | 'tours' | 'transfers'
type SamplePartnerLink = { name: string; url: string }
type SampleListing = {id:string;kind:SampleKind;title:string;category:string;subtitle:string;price:number;score:number;duration:string;perks:string[];affiliateUrl:string;affiliateLinks:SamplePartnerLink[];transmission?:string;fuel?:string;capacity?:string;provider:string;imageUrl:string;seats?:string;bags?:string}
function SampleCard({item,query}:{item:SampleListing;query:SearchQuery}){
 const {money}=usePrefs()
 return <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-orange-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
   <div className="grid sm:grid-cols-[220px_minmax(0,1fr)]">
     <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-white to-slate-100 p-3 sm:h-full sm:min-h-[190px]"><img src={item.imageUrl} alt={item.title} loading="lazy" className="h-full w-full object-contain"/><span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-[#172B4D] shadow">{item.provider}</span></div>
     <div className="flex min-w-0 flex-col justify-between gap-3 p-4 sm:p-5">
       <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold text-slate-900 dark:text-white">{item.title}</h3><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-[#C93400]">{item.category}</span><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-800">{item.score}/10 illustrative</span></div>
         <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
         <div className="mt-3 flex flex-wrap gap-1.5">{item.perks.map(v=><span key={v} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{v}</span>)}{item.seats&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600">{item.seats} seats</span>}{item.bags&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600">{item.bags} bags</span>}{item.transmission&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600">{item.transmission}</span>}{item.fuel&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600">{item.fuel}</span>}{item.kind==='cars'&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600">AC</span>}{item.capacity&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">{item.capacity}</span>}</div>
         <p className="mt-2 text-[11px] font-semibold text-emerald-700">Illustrative partner rates - click to verify live availability</p>
       </div>
       <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-700"><div><p className="text-[10px] text-slate-500">{item.kind==='cars'?'Daily estimate':item.kind==='tours'?'Per person':'Total fare estimate'}</p><p className="text-2xl font-black text-slate-900 dark:text-white">{money(item.price)}{item.kind==='cars'&&<span className="text-xs font-semibold text-slate-500"> / day</span>}</p><p className="text-[10px] text-slate-500">{item.duration}</p></div><div className="flex flex-wrap justify-end gap-2">{item.affiliateLinks.length ? item.affiliateLinks.map(link=><a key={link.name} href={link.url} onClick={()=>recordPartnerCheckout({title:item.title,category:item.kind==='tours'?'activities':item.kind,origin:query.from,destination:query.to,departureDate:query.out,returnDate:query.back,partner:link.name,partnerUrl:link.url})} target="_blank" rel="noopener noreferrer sponsored" data-affiliate-status="verified" className="inline-flex shrink-0 rounded-lg bg-[#FF5500] px-3 py-2.5 text-xs font-bold text-white">Compare {link.name} {String.fromCharCode(8599)}</a>) : <span className="text-xs font-semibold text-slate-500">No verified booking partner link is currently available.</span>}</div></div>
     </div>
   </div>
 </article>
}

const BACKEND_REDIRECT_PARTNERS = new Set(['autoeurope', 'qeeq', 'tiqets', 'gettransfer', 'intui', 'kiwitaxi'])

function buildPartnerRedirectUrl(partner: ReturnType<typeof getAffiliatePartners>[number], query: SearchQuery): string {
  if (!BACKEND_REDIRECT_PARTNERS.has(partner.id)) return partner.url
  const params = new URLSearchParams({ id: partner.id })
  // Kiwitaxi documents route deep links via /search?from=...&to=...; dates are not part of its documented URL contract.
  if (partner.id === 'kiwitaxi' && query.from && query.to) {
    params.set('from', query.from)
    params.set('to', query.to)
  }
  return '/api/affiliates/link?' + params.toString()
}
function PartnerHandoffPanel({ kind, partners, query }: { kind: SampleKind; partners: ReturnType<typeof getAffiliatePartners>; query: SearchQuery }) {
  const category: TripCategory = kind === 'tours' ? 'activities' : kind
  const title = kind === 'cars' ? 'Car rental partners' : kind === 'tours' ? 'Tours & activities partners' : 'Airport transfer partners'
  return <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
    <div className="mx-auto max-w-2xl text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-orange-50 text-[#FF5500] dark:bg-orange-950/40"><Icon name="arrowUpRight" className="size-7" /></div>
      <h2 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">Continue with a verified booking partner</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{title} display their own options and confirm current availability, prices and booking terms. Trexifly does not operate vehicles, tours or transfer services.</p>
      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Choose a partner below to continue. Kiwitaxi route searches can carry your pick-up and destination through its documented deep link when a tracked link is available. Car dates, driver age, activity dates, transfer dates and other details may need to be entered again on the partner website.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {partners.map(partner => <a key={partner.id} href={buildPartnerRedirectUrl(partner, query)} onClick={() => recordPartnerCheckout({ title: queryTitleForTrips(query, category), category, origin: query.from, destination: query.to, departureDate: query.out, returnDate: query.back, partner: partner.name, partnerUrl: partner.url })} target="_blank" rel="noopener noreferrer sponsored" data-affiliate-status="verified" data-affiliate-partner={partner.id} data-affiliate-fallback={partner.url} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF5500] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#E64A00]">Search {partner.name}<Icon name="arrowUpRight" className="size-4" /></a>)}
      </div>
    </div>
  </div>
}

export function Results() {
  const [params, setParams] = useSearchParams()
  const query = readQuery(params)
  const [savedNotice, setSavedNotice] = useState('')
  const tripCategory: TripCategory = params.get('type') === 'transfers' || params.get('service') === 'airport-transfer' ? 'transfers' : query.type === 'flights' ? 'flights' : query.type === 'tours' ? 'activities' : query.type === 'cars' ? 'cars' : 'hotels'
  const saveCurrentItinerary = () => { saveTrip({ title: queryTitleForTrips(query, tripCategory), category: tripCategory, origin: query.from, destination: query.to, departureDate: query.out, returnDate: query.back }); setSavedNotice('Itinerary saved to My Trips on this device.') }
  useEffect(() => {
    const onTab = (e: Event) => {
      const next = (e as CustomEvent<{ tab?: string }>).detail?.tab
      if (!next) return
      const nextParams = new URLSearchParams(params)
      if (next === 'transfers') {
        nextParams.set('type', 'transfers')
        nextParams.set('service', 'airport-transfer')
      } else {
        nextParams.delete('service')
        nextParams.set('type', next)
      }
      setParams(nextParams, { replace: true })
    }
    window.addEventListener('trexifly:results-tab', onTab)
    return () => window.removeEventListener('trexifly:results-tab', onTab)
  }, [params, setParams])
  const transfer = params.get('type') === 'transfers' || params.get('service') === 'airport-transfer'
  const deals = transfer || query.type === 'cars' || query.type === 'tours' || query.type === 'flights' ? [] : dealsFor(query)
  const hotelInventory = query.type === 'hotels' && !transfer ? generateHotelInventory(query) : []
  const partnerLinks = transfer ? getAffiliatePartners('transfers') : query.type === 'flights' || query.type === 'hotels' ? [] : getAffiliatePartners(query.type)
  const hotelProviderLinks = query.type === 'hotels' && !transfer ? buildHotelProviderLinks(query) : []
  const { money } = usePrefs()
  const sampleKind:SampleKind|null = transfer ? 'transfers' : query.type === 'cars' || query.type === 'tours' ? query.type : null
  const sampleRows: SampleListing[] = []
  const max = deals.length ? Math.max(...deals.map(d=>d.price)) : 0
  const [cap,setCap] = useState(max)
  const [stops,setStops] = useState<string[]>([])
  const [airlines,setAirlines] = useState<string[]>([])
  const [flightCabins,setFlightCabins] = useState<string[]>([])
  const [baggage,setBaggage] = useState(false)
  const [sort,setSort] = useState<SortMode>('Best')
  const [hotelStars,setHotelStars] = useState<number[]>([])
  const [hotelSort,setHotelSort] = useState<'Lowest Price'|'Highest Price'|'Top Rated'|'Star Rating'>('Lowest Price')
  const [hotelPageSize,setHotelPageSize] = useState(12)
  const [sampleCategory,setSampleCategory] = useState<string[]>([])
  const [sampleTransmission,setSampleTransmission] = useState<string[]>([])
  const [sampleDuration,setSampleDuration] = useState<string[]>([])
  const [sampleSort,setSampleSort] = useState<'Price'|'Rating'>('Price')
  const toggle=(list:string[],value:string,setter:(v:string[])=>void)=>setter(list.includes(value)?list.filter(v=>v!==value):[...list,value])
  const eligibleDeals=useMemo(()=>deals.filter(d=>d.price<=cap).filter(d=>!stops.length||stops.includes(d.stopsCount===0?'Non-stop / Direct':d.stopsCount===1?'1 Stop':'2+ Stops')).filter(d=>!airlines.length||airlines.includes(d.airline ?? airlineName(d))).filter(d=>!flightCabins.length||flightCabins.includes(d.cabinClass ?? 'Economy')).filter(d=>!baggage||d.perks.some(p=>/bag/i.test(p))),[deals,cap,stops,airlines,flightCabins,baggage])
  const filtered=useMemo(()=>[...eligibleDeals].sort((a,b)=>sort==='Cheapest'?a.price-b.price:sort==='Fastest'?a.durationMinutes-b.durationMinutes:sort==='Earliest Departure'?(a.departureMinutes??0)-(b.departureMinutes??0):b.score-a.score),[eligibleDeals,sort])
  const filteredSamples=useMemo(()=>[...sampleRows].filter(v=>!sampleCategory.length||sampleCategory.includes(v.category)).filter(v=>!sampleTransmission.length||sampleTransmission.includes(v.transmission??'')).filter(v=>!sampleDuration.length||sampleDuration.includes(v.duration)).sort((a,b)=>sampleSort==='Price'?a.price-b.price:b.score-a.score),[sampleRows,sampleCategory,sampleTransmission,sampleDuration,sampleSort])
  const filteredHotels=useMemo(()=>{const rows=hotelInventory.filter(h=>!hotelStars.length||hotelStars.includes(h.stars));return [...rows].sort((a,b)=>hotelSort==='Lowest Price'?a.price-b.price:hotelSort==='Highest Price'?b.price-a.price:hotelSort==='Top Rated'?b.score-a.score:b.stars-a.stars)},[hotelInventory,hotelStars,hotelSort])
  const check=(text:string,checked:boolean,onChange:()=>void)=><label key={text} className="flex cursor-pointer items-center gap-2 py-1.5 text-xs text-slate-700"><input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-[#FF5500]"/>{text}</label>
  const heading=transfer?'Airport transfers':String(query.type)==='hotels'?'Stays in '+query.to:query.type==='cars'?'Car rentals in '+query.from:query.type==='tours'?'Activities in '+query.to:query.from+' to '+query.to
  const flightAdults = Number(params.get('adults') ?? query.adults ?? 2)
  const flightChildren = Number(params.get('children') ?? query.children ?? 0)
  const flightInfants = Number(params.get('infants') ?? 0)
  const flightCabin = params.get('cabin') ?? query.pax.match(/premium economy|business|first class|first|economy/i)?.[0] ?? 'Economy'
  const flightOneWay = params.get('tripType') === 'one-way' || (!params.has('tripType') && query.back === query.out)
  if (query.type === 'flights' && !transfer) return <LiveFlightsResults query={query} infants={Math.min(9, Math.max(0, Number(params.get('infants') ?? 0)))} />
  return <div className="results-page min-h-screen bg-[#FFF7F2] pb-16 pt-8 dark:bg-slate-950">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <Link to="/" className="text-xs font-semibold text-[#FF5500] hover:underline">Back to search</Link>
      <div className="mb-5 mt-3 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{heading}</h1><p className="mt-1 text-xs text-slate-600">{query.type === 'hotels' ? 'Trexifly does not display live hotel listings or prices. Use the official partner link below to check current properties, availability and final rates.' : sampleKind ? 'Continue to partner websites to review their own current options, availability, final prices and booking terms. Some search details may need to be entered again.' : 'Illustrative estimates only. Final prices and availability must be confirmed with the booking provider.'}</p>{savedNotice && <p role="status" className="mt-2 text-xs font-semibold text-emerald-700">{savedNotice}</p>}</div><button type="button" onClick={saveCurrentItinerary} className="rounded-lg border border-[#FF5500] bg-white px-4 py-2.5 text-xs font-bold text-[#D94700] hover:bg-orange-50">Save itinerary to My Trips</button></div>
      {<div className="mb-6 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900"><SearchWidget initial={query} compact hideCategoryTabs/></div>}
      {!sampleKind && query.type !== 'flights' && partnerLinks.length > 0 && <section aria-label="Official booking partners" className="mb-6 rounded-xl border border-orange-100 bg-white p-4 shadow-sm"><div className="mb-3"><h2 className="font-bold text-slate-900">Official booking partners</h2><p className="mt-1 text-xs text-slate-600">Compare options and continue securely with the selected booking partner.</p></div><div className="flex flex-wrap gap-2">{partnerLinks.map(partner=><a key={partner.id} href={partner.url} target="_blank" rel="noopener noreferrer sponsored" data-affiliate-partner={partner.id} className="inline-flex items-center gap-2 rounded-lg bg-[#FF5500] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#E64A00]">Continue to {partner.name}<Icon name="arrowUpRight" className="size-4"/></a>)}</div></section>}
      {query.type === 'flights' && !transfer ? <section aria-label="Live flight comparison" className="mb-6 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7">
        <div className="mb-5"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#FF5500]">Live Flight Comparison</p><h2 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">Your selected journey</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Live availability and final fares are checked on our flight partners.</p></div>
        <div className="grid gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800 sm:grid-cols-2 lg:grid-cols-3">
          <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Route</p><p className="mt-1 font-bold text-slate-900 dark:text-white">{query.from} <span className="text-[#FF5500]">→</span> {query.to}</p></div>
          <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Dates</p><p className="mt-1 font-bold text-slate-900 dark:text-white">{new Date(query.out + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}{flightOneWay ? ' | One-way' : ' - ' + new Date(query.back + 'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</p></div>
          <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cabin</p><p className="mt-1 font-bold text-slate-900 dark:text-white">{flightCabin}</p></div>
          <div className="sm:col-span-2 lg:col-span-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Passengers</p><p className="mt-1 font-bold text-slate-900 dark:text-white">{flightAdults} {flightAdults === 1 ? 'Adult' : 'Adults'}, {flightChildren} {flightChildren === 1 ? 'Child' : 'Children'}, {flightInfants} {flightInfants === 1 ? 'Infant' : 'Infants'}</p></div>
        </div>

      </section> : <div className={'grid items-start gap-5 ' + (query.type === 'hotels' || sampleKind ? '' : 'lg:grid-cols-[250px_minmax(0,1fr)]')}>
        {query.type !== 'hotels' && !sampleKind && <aside className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          {transfer ? <><h2 className="font-bold text-slate-900">Airport transfer filters</h2><p className="mt-2 text-xs leading-5 text-slate-600">Compare private, VIP, family, SUV, minibus and shared vehicle examples.</p></> : <>
            <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-slate-900">Filter by</h2><button onClick={()=>{setCap(max);setStops([]);setAirlines([]);setBaggage(false);setHotelStars([]);setHotelPageSize(12);setFlightCabins([]);setSampleCategory([]);setSampleTransmission([]);setSampleDuration([]);setSampleSort('Price')}} className="text-xs font-semibold text-[#FF5500]">Reset</button></div>
            {sampleKind==='cars' && <FilterGroup title="Vehicle category"><div className="flex flex-wrap gap-2">{[...new Set(sampleRows.map(v=>v.category))].map(v=><button key={v} type="button" onClick={()=>toggle(sampleCategory,v,setSampleCategory)} className={'rounded-full px-3 py-2 text-[11px] font-semibold '+(sampleCategory.includes(v)?'bg-[#FF5500] text-white':'bg-orange-50 text-slate-700')}>{v}</button>)}</div></FilterGroup>}
            {sampleKind==='cars' && <FilterGroup title="Transmission">{['Automatic','Manual'].map(v=>check(v,sampleTransmission.includes(v),()=>toggle(sampleTransmission,v,setSampleTransmission)))}</FilterGroup>}
            {sampleKind==='tours' && <FilterGroup title="Activity category"><div className="flex flex-wrap gap-2">{[...new Set(sampleRows.map(v=>v.category))].map(v=><button key={v} type="button" onClick={()=>toggle(sampleCategory,v,setSampleCategory)} className={'rounded-full px-3 py-2 text-[11px] font-semibold '+(sampleCategory.includes(v)?'bg-[#FF5500] text-white':'bg-orange-50 text-slate-700')}>{v}</button>)}</div></FilterGroup>}
            {sampleKind==='tours' && <FilterGroup title="Duration">{['Half-Day','Full-Day','Multi-Day'].map(v=>check(v,sampleDuration.includes(v),()=>toggle(sampleDuration,v,setSampleDuration)))}</FilterGroup>}
            {sampleKind==='transfers' && <FilterGroup title="Vehicle type"><div className="flex flex-wrap gap-2">{[...new Set(sampleRows.map(v=>v.category))].map(v=><button key={v} type="button" onClick={()=>toggle(sampleCategory,v,setSampleCategory)} className={'rounded-full px-3 py-2 text-[11px] font-semibold '+(sampleCategory.includes(v)?'bg-[#FF5500] text-white':'bg-orange-50 text-slate-700')}>{v}</button>)}</div></FilterGroup>}
{String(query.type)==='hotels' && <FilterGroup title="Star rating"><div className="space-y-1"><button type="button" onClick={()=>setHotelStars([])} aria-pressed={!hotelStars.length} className={'w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold '+(!hotelStars.length?'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-200':'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800')}>All Stars ({hotelInventory.length})</button>{([1,2,3,4,5,7] as const).map(star=>{const count=hotelInventory.filter(h=>h.stars===star).length;const selected=hotelStars.includes(star);const label=star===1?'1 Star · Budget':star===2?'2 Stars':star===3?'3 Stars · Mid-Range':star===4?'4 Stars · Upscale':star===5?'5 Stars · Luxury':'7 Stars · Ultra-Luxury';return count>0?<button key={star} type="button" onClick={()=>setHotelStars(selected?hotelStars.filter(v=>v!==star):[...hotelStars,star])} aria-pressed={selected} className={'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs '+(selected?'bg-orange-100 font-bold text-orange-800 dark:bg-orange-950/50 dark:text-orange-200':'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800')}><span>{label}</span><span>{count}</span></button>:null})}</div></FilterGroup>}
            {!sampleKind && <FilterGroup title="Maximum price"><div className="flex justify-between text-xs text-slate-600"><span>Up to</span><strong>{money(cap)}</strong></div><input aria-label="Maximum price" type="range" min={Math.min(...deals.map(d=>d.price))} max={max} step="5" value={cap} onChange={e=>setCap(Number(e.target.value))} className="mt-3 w-full accent-[#FF5500]"/></FilterGroup>}
            <p className="mt-2 text-[11px] leading-5 text-slate-500">Filters apply to the indicative comparison examples shown here.</p>
          </>}
        </aside>}
        <section className="min-w-0">
          {query.type === 'hotels' ? <section aria-label="Hotel booking partner handoff" className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8"><div className="mx-auto max-w-3xl text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-orange-50 text-[#FF5500] dark:bg-orange-950/40"><Icon name="bed" className="size-7" /></div><p className="mt-4 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#D94700]">Hotel booking partners</p><h2 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">Compare hotel booking partners</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Search {query.to} with your selected stay dates, guests and rooms on the partner site. Confirm current properties, availability and final prices directly with the provider.</p><div className="mt-5 flex flex-wrap justify-center gap-3">{hotelProviderLinks.map(partner => <a key={partner.id} href={partner.url} onClick={() => recordPartnerCheckout({ title: 'Hotels in ' + query.to, category: 'hotels', origin: '', destination: query.to, departureDate: query.out, returnDate: query.back, partner: partner.name, partnerUrl: partner.url })} target="_blank" rel="noopener noreferrer sponsored" data-affiliate-partner={partner.id} data-affiliate-status={partner.tracking} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF5500] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-200 transition hover:bg-[#E64A00]">{'Search hotels on ' + partner.name} <Icon name="arrowUpRight" className="size-4" /></a>)}</div><p className="mt-4 text-[10px] leading-5 text-slate-500 dark:text-slate-400">Trexifly may earn a commission from eligible bookings. Destination, dates, guest counts, child ages and room count are sent through Trexifly's secure affiliate redirect. If Travelpayouts cannot generate a dynamic tracked link, the supplied Trip.com affiliate fallback is used and some details may need to be entered again. Trexifly does not display live hotel inventory or guarantee availability.</p><Link to="/?tab=hotels#search-widget" className="mt-3 inline-flex items-center justify-center rounded-lg border border-orange-200 px-4 py-2.5 text-xs font-bold text-[#D94700] hover:bg-orange-50 dark:border-slate-600 dark:text-orange-300">Edit hotel search</Link></div></section> : sampleKind ? <PartnerHandoffPanel kind={sampleKind} partners={partnerLinks} query={query}/> : <>
            <div className="mb-4"><h2 className="font-bold text-slate-900 dark:text-white">{sampleKind ? filteredSamples.length : String(query.type)==='hotels'?filteredHotels.length:filtered.length} options to compare</h2><p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Select a provider to continue</p></div>
            {sampleKind ? <div className="mb-4 flex flex-wrap items-center gap-2">{(['Price','Rating'] as const).map(mode=><button key={mode} type="button" onClick={()=>setSampleSort(mode)} aria-pressed={sampleSort===mode} className={'rounded-lg px-3 py-2 text-xs font-bold '+(sampleSort===mode?'bg-[#FF5A00] text-white':'bg-white text-slate-600')}>{mode==='Price'?'Lowest Price':'Top Rated'}</button>)}</div> : String(query.type)==='hotels' ? <div className="mb-4 flex flex-wrap items-center gap-2">{(['Lowest Price','Highest Price','Top Rated','Star Rating'] as const).map(mode=><button key={mode} type="button" onClick={()=>setHotelSort(mode)} aria-pressed={hotelSort===mode} className={'rounded-lg px-3 py-2 text-xs font-bold '+(hotelSort===mode?'bg-[#FF5A00] text-white':'bg-white text-slate-600 hover:bg-orange-50 dark:bg-slate-800 dark:text-slate-200')}>{mode}</button>)}</div> : <div className="mb-4 flex gap-2">{(['Best','Cheapest','Fastest'] as SortMode[]).map(v=><button key={v} onClick={()=>setSort(v)} className={'rounded-lg px-3 py-2 text-xs font-bold '+(sort===v?'bg-[#FF5A00] text-white':'bg-white text-slate-600 hover:bg-orange-50')}>{v}</button>)}</div>}
            <div className="space-y-3">{sampleKind ? (filteredSamples.length ? filteredSamples.map(item=><SampleCard key={item.id} item={item} query={query}/>) : <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">No listings match these filters. Reset filters to see all examples.</div>) : String(query.type)==='hotels' ? (filteredHotels.length ? filteredHotels.slice(0,hotelPageSize).map(hotel=><HotelCard key={hotel.id} hotel={hotel} query={query}/>) : <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">No hotels match this star filter. Choose All Stars to see every sample.</div>) : (filtered.length?filtered.map(deal=><OfferCard key={deal.id} deal={deal}/>):<div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">No offers match these filters. Reset your filters to see all options.</div>)}</div>
            {String(query.type)==='hotels' && hotelPageSize<filteredHotels.length && <button type="button" onClick={()=>setHotelPageSize(v=>v+12)} className="mt-5 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-bold text-[#D94700] transition hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-900 dark:text-orange-300">Load More Hotels ({filteredHotels.length-hotelPageSize} remaining)</button>}
            <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4 text-xs leading-5 text-slate-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-100">{sampleKind ? 'Illustrative partner rates - click to verify live availability. Car, tour and transfer listings, ratings, durations, capacities and prices are generated examples, not live inventory or confirmed bookings. Verify final terms and availability with the linked partner.' : String(query.type)==='hotels'?'Compare live room rates with Trexifly partner sites. Choose a provider to check current property availability, room details, taxes and final prices before booking.':'Trexifly currently displays illustrative comparison estimates, not live inventory. These are not guaranteed fares, room rates or vehicle availability. Confirm the final price, taxes, terms and availability with the booking provider before paying.'}</div>
          </>}
        </section>
      </div>}
    </div>
  </div>
}
