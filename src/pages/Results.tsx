import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Icon } from '../components/Icons'
import { SearchWidget } from '../components/SearchWidget'
import { readQuery, dealsFor, PLACES, type Deal, type SearchQuery } from '../lib/data'
import { generateHotelInventory, type HotelListing } from '../lib/hotels'
import { getAffiliatePartners, buildAffiliateUrl } from '../lib/affiliates'
import { buildHotelProviderLinks } from '../lib/hotelLinks'
import { usePrefs } from '../lib/prefs'
import { imgFallback } from '../lib/imageFallback'
import { CAR_ROWS, TRANSFER_ROWS, getInventoryVehicleVisual } from '../data/vehicleInventory'


function HotelCard({ hotel, query }: { hotel: HotelListing; query: SearchQuery }) {
  const { money } = usePrefs()
  const [saved, setSaved] = useState(false)
  const directLinks = buildHotelProviderLinks(query)
  const [links, setLinks] = useState(directLinks.map(link => ({ ...link, status: 'unverified' as 'verified' | 'unverified' })))
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/affiliates/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ links: directLinks.map(({ id, url }) => ({ id, url })) }),
      signal: controller.signal,
    }).then(async response => {
      if (!response.ok) throw new Error('Affiliate link conversion unavailable')
      const payload = await response.json() as { links?: Array<{ id: string; url: string; status: 'verified' | 'unverified' }> }
      if (Array.isArray(payload.links)) setLinks(current => current.map(link => {
        const converted = payload.links?.find(item => item.id === link.id)
        return converted ? { ...link, url: converted.url, status: converted.status } : link
      }))
    }).catch(() => undefined)
    return () => controller.abort()
  }, [query.to, query.out, query.back, query.adults, query.children, query.rooms, query.childAges?.join(',')])
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-xl bg-orange-50 md:h-auto md:w-60 dark:bg-slate-800">
          <img src={hotel.photoUrl} alt={hotel.title + ' sample photo in ' + query.to} loading="lazy" onError={imgFallback} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
          <button type="button" onClick={() => setSaved(!saved)} aria-label="Save property" className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm">
            <span className={saved ? 'text-[#FF5500]' : 'text-slate-500'}>{saved ? 'â™¥' : 'â™¡'}</span>
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{hotel.title}</h3>
              <span className="text-xs font-bold text-amber-500">{hotel.stars}â˜…</span>
              <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#C93400] dark:bg-orange-950/40 dark:text-orange-300">Sample listing</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-[#FF5500]">{query.to} Â· <span className="font-normal text-slate-500">{hotel.neighborhood}</span></p>
            <p className="mt-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">{hotel.address}</p>
            <div className="mt-2 space-y-1 text-xs">
              <p className="font-semibold text-slate-600 dark:text-slate-300">{hotel.subtitle}</p>
              <p className="text-slate-500">Illustrative rating: {hotel.score.toFixed(1)}/10 Â· {hotel.reviews.toLocaleString()} simulated reviews</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {hotel.perks.map(perk => <span key={perk} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{perk}</span>)}
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/70">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Compare booking brands</p>
              <span className="text-[10px] font-semibold text-slate-500">Partner link verification</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {links.map(link => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer sponsored" data-provider-id={link.id} data-affiliate-status={link.status} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-orange-200 bg-white px-2 py-2 text-center text-[11px] font-bold text-slate-800 transition hover:border-[#FF5500] hover:bg-orange-50 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:border-orange-400">
                Search {link.name} {link.status === 'verified' ? 'âœ“' : 'â†—'}
              </a>)}
            </div>
            <p className="mt-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400">Destination, dates and guest counts are pre-filled. Links are labelled verified only after successful Travelpayouts Partner Links API conversion; any direct fallback remains unverified.</p>
          </div>
        </div>
        <div className="flex flex-row items-end justify-between border-t border-slate-100 pt-3 md:w-48 md:shrink-0 md:flex-col md:border-l md:border-t-0 md:pl-4 md:pt-0 dark:border-slate-700">
          <div className="flex items-center gap-2 text-right">
            <div><p className="text-xs font-bold text-slate-900 dark:text-white">Sample score</p><p className="text-[11px] text-slate-500">Not provider verified</p></div>
            <span className="grid size-8 place-items-center rounded-lg rounded-bl-none bg-[#1E293B] text-xs font-extrabold text-white">{hotel.score.toFixed(1)}</span>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-500">{hotel.priceUnit}</p>
            <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{money(hotel.price)}</p>
            <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">Illustrative guide price only</p>
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
function durationText(minutes: number) { return Math.floor(minutes/60)+'h '+String(minutes%60).padStart(2,'0')+'m' }
function AirlineLogo({ name, size='size-10' }: { name: string; size?: string }) {
  const [failed,setFailed] = useState(false)
  const code = AIRLINE_CODES[name]
  return <span className={'grid '+size+' shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-sm'}>
    {code && !failed ? <img src={`https://pics.avs.io/64/64/${code}.png`} alt="" loading="lazy" className="max-h-full max-w-full object-contain" onError={()=>setFailed(true)}/> : <span aria-label={name} className="text-xs font-extrabold text-[#D94700]">{name.split(/\s+/).map(v=>v[0]).join('').slice(0,3).toUpperCase()}</span>}
  </span>
}
const AIRLINES = ['Pakistan International Airlines','Airblue','SereneAir','Fly Jinnah','AirSial','Emirates','Qatar Airways','Etihad Airways','Saudia','Flynas','Flyadeal','flydubai','Air Arabia','Turkish Airlines','Pegasus Airlines','British Airways','Virgin Atlantic','Lufthansa','SWISS','Air France','KLM','Iberia','Air Canada','United Airlines','Delta Air Lines','American Airlines','Singapore Airlines','Malaysia Airlines','Thai Airways','Cathay Pacific','ANA','Japan Airlines','Gulf Air','Oman Air','Kuwait Airways','Azerbaijan Airlines','EgyptAir','Ethiopian Airlines','Qantas']
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
        <div className="sm:text-right"><p className="text-[11px] text-slate-500">{deal.priceUnit}</p><p className="text-2xl font-bold tracking-tight text-slate-900">{money(deal.price)}</p><p className="text-[10px] text-slate-500">Indicative estimate</p>{deal.title.includes(" Â· ") && <p className="mt-1 text-[10px] text-slate-500">Flight number shown on partner site</p>}</div>
        <a href={deal.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#FF5500] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#E64A00]">View Deal <Icon name="arrowUpRight" className="size-4"/></a>
      </div>
    </div>
  </article>
}

type FlightApiOffer = {
  id: string; price: number; currency: string; airlineCode: string; flightNumber: string
  departureAt: string; arrivalAt: string | null; stops: number | null; durationMinutes: number | null
  originAirport?: string; destinationAirport?: string; bookingUrl: string; markerId: string
}
function flightAirportCode(value: string): string {
  const explicit = value.match(/\(([A-Z]{3})\)/i)?.[1]
  if (explicit) return explicit.toUpperCase()
  const normalized = value.toLowerCase()
  return PLACES.find(place => place.code && (normalized.includes(place.city.toLowerCase()) || (!!place.airport && normalized.includes(place.airport.toLowerCase()))))?.code ?? ''
}
const FLIGHT_AIRLINE_NAMES: Record<string,string> = { PK:'Pakistan International Airlines',PA:'Airblue',ER:'SereneAir','9P':'Fly Jinnah',PF:'AirSial',EK:'Emirates',QR:'Qatar Airways',EY:'Etihad Airways',SV:'Saudia',XY:'Flynas',FZ:'flydubai',TK:'Turkish Airlines',BA:'British Airways',LH:'Lufthansa',AF:'Air France',KL:'KLM',AC:'Air Canada',UA:'United Airlines',DL:'Delta Air Lines',AA:'American Airlines',QF:'Qantas',NZ:'Air New Zealand',GF:'Gulf Air',WY:'Oman Air',KU:'Kuwait Airways' }
function FlightTime({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-400">Not supplied</span>
  const date = new Date(value)
  return <span>{Number.isNaN(date.getTime()) ? 'Not supplied' : date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
}
function aviasalesSearchUrl(query: SearchQuery, origin: string, destination: string, oneWay: boolean) {
  const dateCode = (value: string) => { const parsed = new Date(value + 'T00:00:00'); return String(parsed.getDate()).padStart(2, '0') + String(parsed.getMonth() + 1).padStart(2, '0') }
  const adults = Math.min(9, Math.max(1, query.adults ?? 2))
  const children = Math.min(9 - adults, Math.max(0, query.children ?? 0))
  const cabin = /business/i.test(query.pax) ? 'c' : /first/i.test(query.pax) ? 'f' : /premium economy|comfort/i.test(query.pax) ? 'w' : ''
  const route = origin + dateCode(query.out) + destination + (oneWay ? '' : dateCode(query.back)) + cabin + String(adults) + (children ? String(children) : '')
  return 'https://www.aviasales.com/search/' + route + '?marker=806576'
}
function airportDisplay(code: string) {
  const place = PLACES.find(item => item.code === code)
  return place ? place.airport + ', ' + place.code : code
}
function LiveFlightsResults({ query }: { query: SearchQuery }) {
  const [offers,setOffers] = useState<FlightApiOffer[]>([])
  const [flexibleOffers,setFlexibleOffers] = useState<FlightApiOffer[]>([])
  const [status,setStatus] = useState<'loading'|'ready'|'empty'|'error'>('loading')
  const [notice,setNotice] = useState('')
  const [sort,setSort] = useState<'price'|'departure'|'duration'>('price')
  const origin = flightAirportCode(query.from), destination = flightAirportCode(query.to)
  const oneWay = query.back === query.out
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setStatus('loading'); setNotice(''); setOffers([]); setFlexibleOffers([])
      if (!origin || !destination) { setStatus('error'); setNotice('Select a recognised airport from the suggestions so we can search its IATA code.'); return }
      const params = new URLSearchParams({
        origin, destination, departure_at: query.out, one_way: String(oneWay), currency: 'USD',
        adults: String(query.adults ?? 2), children: String(query.children ?? 0),
        trip_class: /business/i.test(query.pax) ? 'C' : /first/i.test(query.pax) ? 'F' : /premium economy|comfort/i.test(query.pax) ? 'W' : 'Y',
      })
      if (!oneWay) params.set('return_at', query.back)
      try {
        const response = await fetch('/api/flights/search?'+params.toString(),{signal:controller.signal,headers:{Accept:'application/json'}})
        const payload = await response.json() as { error?:string; offers?:FlightApiOffer[]; flexibleOffers?:FlightApiOffer[]; cacheWindow?:string }
        if (!response.ok) throw new Error(payload.error || 'Flight fare search is temporarily unavailable.')
        const rows = Array.isArray(payload.offers) ? payload.offers : []
        const flexible = Array.isArray(payload.flexibleOffers) ? payload.flexibleOffers : []
        setOffers(rows); setFlexibleOffers(flexible); setStatus(rows.length?'ready':'empty')
        setNotice(payload.cacheWindow || 'Recent cached fares; not real-time inventory.')
      } catch(error) {
        if(controller.signal.aborted)return
        setStatus('error'); setNotice(error instanceof Error?error.message:'Flight fare search is temporarily unavailable.')
      }
    }
    void load()
    return ()=>controller.abort()
  },[origin,destination,query.out,query.back,oneWay,query.adults,query.children,query.pax])
  const searchUrl = aviasalesSearchUrl(query, origin, destination, oneWay)
  const sorted = [...offers].sort((a,b)=>sort==='price'?a.price-b.price:sort==='departure'?Date.parse(a.departureAt)-Date.parse(b.departureAt):(a.durationMinutes??Number.MAX_SAFE_INTEGER)-(b.durationMinutes??Number.MAX_SAFE_INTEGER))
  const currency = (amount:number,code:string)=>new Intl.NumberFormat('en-US',{style:'currency',currency:/^[A-Z]{3}$/.test(code)?code:'USD',maximumFractionDigits:0}).format(amount)
  return <div className="results-page min-h-screen bg-[#FFF7F2] pb-16 pt-8 dark:bg-slate-950"><div className="mx-auto max-w-[1280px] px-4 sm:px-6">
    <Link to="/" className="text-xs font-semibold text-[#FF5500] hover:underline">Back to search</Link>
    <div className="mb-5 mt-3"><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{query.from} to {query.to}</h1><p className="mt-1 text-xs text-slate-600">Aviasales recent-search fares. Cached estimates are not real-time availability or guaranteed ticket prices.</p></div>
    <div className="mb-6 rounded-xl bg-white p-3 shadow-sm"><SearchWidget initial={query} compact/></div>
    <section className="mb-5 rounded-xl border border-orange-100 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">Recent flight fares</h2><p className="mt-1 text-xs text-slate-500">{origin || '—'} → {destination || '—'} · {query.out}{oneWay ? '\u00B7 One-way' : '\u00B7 Return ' + query.back}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-800">Cached data · Marker 806576</span></div>
      {status==='ready'&&<div className="mt-4 flex flex-wrap gap-2">{([['price','Cheapest'],['departure','Earliest departure'],['duration','Shortest journey']] as const).map(([value,label])=><button key={value} type="button" onClick={()=>setSort(value)} aria-pressed={sort===value} className={'rounded-lg px-3 py-2 text-xs font-bold '+(sort===value?'bg-[#FF5500] text-white':'bg-orange-50 text-slate-700')}>{label}</button>)}</div>}
    </section>
    {status==='loading'&&<div role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">Checking recent Aviasales fare data…</div>}
    {status==='error'&&<div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950"><p className="font-bold">Flight fare data unavailable</p><p className="mt-2">{notice}</p></div>}
    {status==='empty'&&<div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><h2 className="font-bold text-slate-900 dark:text-white">No exact-date cached fare</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No recent fare estimate is available for {query.out}. Check live availability or compare other dates in the same month.</p>{flexibleOffers.length>0&&<section className="mt-5"><h3 className="font-bold text-slate-900 dark:text-white">Flexible dates in {new Date(query.out+'T00:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'})} · From {currency(flexibleOffers[0].price,flexibleOffers[0].currency)}</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{flexibleOffers.map(offer=>{const date=offer.departureAt.slice(0,10);const flexibleUrl=aviasalesSearchUrl({...query,out:date,back:oneWay?date:query.back},origin,destination,oneWay);return <a key={offer.id} href={flexibleUrl} target="_blank" rel="noopener noreferrer sponsored" className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-emerald-400 dark:border-slate-700"><span><strong className="block text-sm text-slate-900 dark:text-white">{new Date(date+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',day:'numeric',month:'short'})}</strong><span className="text-[10px] text-slate-500">{offer.airlineCode || 'Partner cached fare'} · Marker 806576</span></span><strong className="text-sm text-emerald-700 dark:text-emerald-300">{currency(offer.price,offer.currency)} →</strong></a>})}</div></section>}<a href={searchUrl} target="_blank" rel="noopener noreferrer sponsored" className="mt-5 inline-flex rounded-lg bg-[#FF5500] px-4 py-3 text-xs font-bold text-white">Check Exact Date Live Fare → <Icon name="arrowUpRight" className="ml-2 size-4"/></a></div>}
    {status==='ready'&&<div className="space-y-3">{sorted.map(offer=>{
      const carrier = FLIGHT_AIRLINE_NAMES[offer.airlineCode] || offer.airlineCode || 'Airline not supplied'
      const fromCode = offer.originAirport || origin
      const toCode = offer.destinationAirport || destination
      const departureDate = new Date(offer.departureAt)
      const arrivalDate = offer.arrivalAt ? new Date(offer.arrivalAt) : null
      const dateLabel = (value: Date) => value.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      const baggageCount = (query.adults ?? 2) + (query.children ?? 0)
      return <article key={offer.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <AirlineLogo name={carrier} size="size-12"/>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900 dark:text-white">{carrier}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{offer.airlineCode || 'Airline'}</span></div>
              <p className="mt-1 text-xs text-slate-500">{offer.flightNumber ? 'Flight ' + offer.flightNumber + ' · ' : ''}{offer.stops===null?'Stops not supplied':offer.stops===0?'Non-stop':offer.stops+' stop(s)'}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-200">
                <span><strong>{fromCode}</strong><br/><FlightTime value={offer.departureAt}/></span>
                <span><strong>{toCode}</strong><br/><FlightTime value={offer.arrivalAt}/></span>
                {offer.durationMinutes ? <span className="col-span-2 text-slate-500">{durationText(offer.durationMinutes)} journey</span> : null}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 dark:border-slate-700 sm:min-w-[230px] sm:justify-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <div className="sm:text-right"><p className="text-[10px] text-slate-500">Recent partner fare estimate</p><p className="text-2xl font-black text-slate-900 dark:text-white">From {currency(offer.price,offer.currency)}</p><p className="max-w-[190px] text-[10px] text-slate-500">Live seat price & baggage confirmed at checkout.</p></div>
            <a href={searchUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#FF5500] px-4 py-3 text-xs font-bold text-white">View flight <Icon name="arrowUpRight" className="size-4"/></a>
          </div>
        </div>
        <details className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
          <summary className="cursor-pointer list-none text-xs font-bold text-[#D94700] dark:text-orange-300">Fare conditions & flight details <span className="float-right text-slate-400">＋</span></summary>
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
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Fare conditions & baggage guide · {query.pax.match(/(Economy|Business|First Class|Premium Economy)/i)?.[1] ?? 'Economy'}</h4>
              <div className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-200">
                <p className="rounded-md bg-white px-3 py-2 dark:bg-slate-900">Personal item — 1 pc per passenger</p>
                <p className="rounded-md bg-white px-3 py-2 dark:bg-slate-900">Carry-on: Check fare tier</p>
                <p className="rounded-md bg-white px-3 py-2 dark:bg-slate-900">Checked baggage: Optional / fare-dependent</p>
                <p className="rounded-md bg-white px-3 py-2 dark:bg-slate-900">Exchangeable for additional fee</p>
                <p className="rounded-md bg-white px-3 py-2 dark:bg-slate-900">Refund policy: Fare-dependent</p>
                <p className="font-semibold">Passenger summary: {query.adults ?? 2} adult(s) + {query.children ?? 0} child(ren) = {baggageCount} travellers. Allowance is per-ticket and must be confirmed for each passenger.</p>
              </div>
              <a href={searchUrl} target="_blank" rel="noopener noreferrer sponsored" className="mt-3 inline-flex items-center rounded-lg bg-[#FF5500] px-3 py-2.5 text-xs font-bold text-white">Change fare / Select baggage on partner →</a>
            </section>
          </div>
          <p className="mt-3 text-[10px] leading-4 text-slate-500 dark:text-slate-400">Baggage and exchange/refund rows are general guidance, not verified fare-family rules. Final conditions depend on the selected ticket and are confirmed by the airline or booking partner at checkout.</p>
        </details>
      </article>
    })}</div>}
    <p className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4 text-xs leading-5 text-slate-700">{notice||'Prices are based on Aviasales cached search data. The provider may no longer have the fare; verify schedule, baggage, taxes and availability before booking. The affiliate link carries Trexifly marker 806576.'}</p>
  </div></div>
}

type SampleKind = 'cars' | 'tours' | 'transfers'
type SampleListing = {id:string;kind:SampleKind;title:string;category:string;subtitle:string;price:number;score:number;duration:string;perks:string[];affiliateUrl:string;transmission?:string;fuel?:string;capacity?:string;provider:string;imageUrl:string;seats?:string;bags?:string}
const TOUR_PHOTOS=['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85','https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85']
const CAR_SUPPLIERS=['Europcar','Hertz','Avis','Sixt','Budget','Enterprise','Dollar']
const TOUR_SUPPLIERS=['Klook','Tiqets','KKday']
const TRANSFER_SUPPLIERS=['GetTransfer','Kiwitaxi','Intui.travel']
const TOUR_ROWS:Array<[string,string,number,string,string[]]>=[
['Old Town & City Highlights','City Tours & Sightseeing',35,'Half-Day',['Local guide','Small group']],['Hop-on Hop-off City Pass','City Tours & Sightseeing',49,'Full-Day',['Flexible stops','Digital ticket']],['Guided Food & Market Walk','City Tours & Sightseeing',42,'Half-Day',['Food tasting','Local guide']],['Panoramic Night City Tour','City Tours & Sightseeing',39,'Half-Day',['Evening departure','Photo stops']],['Private City Discovery','City Tours & Sightseeing',95,'Full-Day',['Private guide','Hotel pickup']],
['Desert Safari & Dune Drive','Adventure & Desert Safari / Mountain Expeditions',68,'Half-Day',['4x4 dune drive','Refreshments']],['Sunset Desert Camp','Adventure & Desert Safari / Mountain Expeditions',82,'Half-Day',['Sunset stop','Camp experience']],['Mountain Jeep Expedition','Adventure & Desert Safari / Mountain Expeditions',115,'Full-Day',['4x4 transport','Scenic stops']],['Guided Valley Trek','Adventure & Desert Safari / Mountain Expeditions',74,'Full-Day',['Trail guide','Water included']],['Multi-Day Mountain Explorer','Adventure & Desert Safari / Mountain Expeditions',340,'Multi-Day',['Local host','Multi-day itinerary']],
['Burj Khalifa Observation Deck','Theme Parks & Observation Decks',58,'Half-Day',['Timed entry','Mobile ticket']],['Ferrari World Day Pass','Theme Parks & Observation Decks',89,'Full-Day',['Entry ticket','Ride access']],['Universal Studios Day Pass','Theme Parks & Observation Decks',96,'Full-Day',['Entry ticket','Digital voucher']],['Aquarium & Underwater Zoo','Theme Parks & Observation Decks',52,'Half-Day',['Timed entry','Family friendly']],['City Observation Wheel','Theme Parks & Observation Decks',32,'Half-Day',['Timed entry','Panoramic views']],
['Historic Quarter Heritage Walk','Cultural, Heritage & Day Trips',38,'Half-Day',['Heritage guide','Walking tour']],['Museum & Gallery Pass','Cultural, Heritage & Day Trips',45,'Full-Day',['Museum entry','Digital pass']],['UNESCO Heritage Day Trip','Cultural, Heritage & Day Trips',125,'Full-Day',['Transport','Expert guide']],['Traditional Cooking Workshop','Cultural, Heritage & Day Trips',65,'Half-Day',['Hands-on class','Meal included']],['Nearby City Day Trip','Cultural, Heritage & Day Trips',108,'Full-Day',['Round-trip transport','Guide']],
['Cappadocia Scenic Day Tour','Cultural, Heritage & Day Trips',135,'Full-Day',['Transfers','Sightseeing']],['Skardu Lakes & Valleys Tour','Adventure & Desert Safari / Mountain Expeditions',185,'Multi-Day',['Local guide','Mountain transport']],['Hunza Forts & Village Tour','Cultural, Heritage & Day Trips',92,'Full-Day',['Heritage stops','Local guide']],['Swat & Kalam Nature Escape','Adventure & Desert Safari / Mountain Expeditions',210,'Multi-Day',['Scenic drive','Local host']],['Makkah Ziyarat Highlights','Cultural, Heritage & Day Trips',55,'Half-Day',['Ziyarat stops','Guide']],['Madinah Ziyarat Highlights','Cultural, Heritage & Day Trips',52,'Half-Day',['Ziyarat stops','Guide']],['Airport-to-City Welcome Tour','City Tours & Sightseeing',59,'Half-Day',['Meet & greet','Private vehicle']],['Landmark & Photo Tour','City Tours & Sightseeing',88,'Full-Day',['Photo stops','Flexible itinerary']]]
function tourAffiliateUrl(index:number){const partners=[...getAffiliatePartners('tours'),...getAffiliatePartners('hotels').filter(p=>p.id==='klook-hotels'||p.id==='kkday')];return partners[index%partners.length].url}
function makeSamples(kind:SampleKind,route:string):SampleListing[]{
 const factor=/pakistan|lahore|islamabad|karachi|makkah|madinah|jeddah|riyadh/i.test(route)?0.82:1
 const seed=[...route].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7)
 if(kind==='cars')return CAR_ROWS.map((r,i)=>({id:'car-'+i,kind,title:r[0],category:r[1],subtitle:route+' - '+r[1]+' - Per-day estimate',price:Math.round(r[2]*factor*(0.92+((seed+i*17)%19)/100)),score:Number((8.1+((seed+i*13)%19)/10).toFixed(1)),duration:'Per day',perks:['Illustrative partner rates','Air conditioning','Unlimited mileage estimate'],affiliateUrl:buildAffiliateUrl('cars',i),transmission:r[3],fuel:i%3===0?'Hybrid':i%3===1?'Petrol':'Diesel',provider:CAR_SUPPLIERS[i%CAR_SUPPLIERS.length],imageUrl:getInventoryVehicleVisual(r[0],r[1]).src,seats:i%4===0?'4':'5',bags:i%3===0?'2':'3'}))
 if(kind==='tours')return TOUR_ROWS.map((r,i)=>({id:'tour-'+i,kind,title:r[0],category:r[1],subtitle:route+' - '+r[3]+' experience',price:Math.round(r[2]*factor*(0.93+((seed+i*11)%17)/100)),score:Number((8.2+((seed+i*7)%18)/10).toFixed(1)),duration:r[3],perks:r[4],affiliateUrl:tourAffiliateUrl(i),provider:TOUR_SUPPLIERS[i%TOUR_SUPPLIERS.length],imageUrl:TOUR_PHOTOS[i%TOUR_PHOTOS.length]}))
 return TRANSFER_ROWS.map((r,i)=>({id:'transfer-'+i,kind,title:r[0],category:r[1],subtitle:route+' - '+r[3],price:Math.round(r[2]*factor*(0.94+((seed+i*9)%15)/100)),score:Number((8.3+((seed+i*5)%17)/10).toFixed(1)),duration:'One-way estimate',perks:r[4],capacity:r[3],affiliateUrl:buildAffiliateUrl('transfers',i),provider:TRANSFER_SUPPLIERS[i%TRANSFER_SUPPLIERS.length],imageUrl:getInventoryVehicleVisual(r[0],r[1]).src}))
}
function SampleCard({item}:{item:SampleListing}){
 const {money}=usePrefs()
 return <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-orange-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
   <div className="grid sm:grid-cols-[220px_minmax(0,1fr)]">
     <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-white to-slate-100 p-3 sm:h-full sm:min-h-[190px]"><img src={item.imageUrl} alt={item.title} loading="lazy" className="h-full w-full object-contain"/><span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-[#172B4D] shadow">{item.provider}</span></div>
     <div className="flex min-w-0 flex-col justify-between gap-3 p-4 sm:p-5">
       <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold text-slate-900 dark:text-white">{item.title}</h3><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-[#C93400]">{item.category}</span><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-800">? {item.score}/10 illustrative</span></div>
         <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
         <div className="mt-3 flex flex-wrap gap-1.5">{item.perks.map(v=><span key={v} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{v}</span>)}{item.seats&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600">{item.seats} seats</span>}{item.bags&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600">{item.bags} bags</span>}{item.transmission&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600">{item.transmission}</span>}{item.fuel&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600">{item.fuel}</span>}{item.kind==='cars'&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-600">AC</span>}{item.capacity&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">{item.capacity}</span>}</div>
         <p className="mt-2 text-[11px] font-semibold text-emerald-700">Illustrative partner rates - click to verify live availability</p>
       </div>
       <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-700"><div><p className="text-[10px] text-slate-500">{item.kind==='cars'?'Daily estimate':item.kind==='tours'?'Per person':'Total fare estimate'}</p><p className="text-2xl font-black text-slate-900 dark:text-white">{money(item.price)}{item.kind==='cars'&&<span className="text-xs font-semibold text-slate-500"> / day</span>}</p><p className="text-[10px] text-slate-500">{item.duration}</p></div><a href={item.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex shrink-0 rounded-lg bg-[#FF5500] px-4 py-2.5 text-xs font-bold text-white">Verify with {item.provider} -</a></div>
     </div>
   </div>
 </article>
}
function usesLiveFlightSearch(query: SearchQuery): boolean { return query.type === 'flights' }

export function Results() {
  const [params, setParams] = useSearchParams()
  const query = readQuery(params)
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
  const partnerLinks = query.type === 'hotels' ? [] : transfer ? getAffiliatePartners('transfers') : query.type === 'tours' ? [...getAffiliatePartners('tours'), ...getAffiliatePartners('hotels').filter(p => p.id === 'klook-hotels' || p.id === 'kkday')] : getAffiliatePartners(query.type)
  const { money } = usePrefs()
  const sampleKind:SampleKind|null = transfer ? 'transfers' : query.type === 'cars' || query.type === 'tours' ? query.type : null
  const sampleRows = sampleKind ? makeSamples(sampleKind, sampleKind === 'tours' ? query.to : query.from+' ? '+query.to) : []
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
  const heading=transfer?'Airport transfers':query.type==='hotels'?'Stays in '+query.to:query.type==='cars'?'Car rentals in '+query.from:query.type==='tours'?'Activities in '+query.to:query.from+' to '+query.to
  if (usesLiveFlightSearch(query)) return <LiveFlightsResults query={query} />
  return <div className="results-page min-h-screen bg-[#FFF7F2] pb-16 pt-8 dark:bg-slate-950">
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <Link to="/" className="text-xs font-semibold text-[#FF5500] hover:underline">Back to search</Link>
      <div className="mb-5 mt-3"><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{heading}</h1><p className="mt-1 text-xs text-slate-600">Illustrative estimates only. Final prices and availability must be confirmed with the booking provider.</p></div>
      <div className="mb-6 rounded-xl bg-white p-3 shadow-sm"><SearchWidget initial={query} compact/></div>
      {partnerLinks.length > 0 && <section aria-label="Official booking partners" className="mb-6 rounded-xl border border-orange-100 bg-white p-4 shadow-sm"><div className="mb-3"><h2 className="font-bold text-slate-900">Official booking partners</h2><p className="mt-1 text-xs text-slate-600">Continue to a Travelpayouts-tracked partner site. Search details may need to be entered again on the partner website.</p></div><div className="flex flex-wrap gap-2">{partnerLinks.map(partner=><a key={partner.id} href={partner.url} target="_blank" rel="noopener noreferrer sponsored" data-affiliate-partner={partner.id} className="inline-flex items-center gap-2 rounded-lg bg-[#FF5500] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#E64A00]">Continue to {partner.name}<Icon name="arrowUpRight" className="size-4"/></a>)}</div></section>}
      <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          {transfer ? <><h2 className="font-bold text-slate-900">Airport transfer filters</h2><p className="mt-2 text-xs leading-5 text-slate-600">Compare private, VIP, family, SUV, minibus and shared vehicle examples.</p></> : <>
            <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-slate-900">Filter by</h2><button onClick={()=>{setCap(max);setStops([]);setAirlines([]);setBaggage(false);setHotelStars([]);setHotelPageSize(12);setFlightCabins([]);setSampleCategory([]);setSampleTransmission([]);setSampleDuration([]);setSampleSort('Price')}} className="text-xs font-semibold text-[#FF5500]">Reset</button></div>
            {sampleKind==='cars' && <FilterGroup title="Vehicle category"><div className="flex flex-wrap gap-2">{[...new Set(sampleRows.map(v=>v.category))].map(v=><button key={v} type="button" onClick={()=>toggle(sampleCategory,v,setSampleCategory)} className={'rounded-full px-3 py-2 text-[11px] font-semibold '+(sampleCategory.includes(v)?'bg-[#FF5500] text-white':'bg-orange-50 text-slate-700')}>{v}</button>)}</div></FilterGroup>}
            {sampleKind==='cars' && <FilterGroup title="Transmission">{['Automatic','Manual'].map(v=>check(v,sampleTransmission.includes(v),()=>toggle(sampleTransmission,v,setSampleTransmission)))}</FilterGroup>}
            {sampleKind==='tours' && <FilterGroup title="Activity category"><div className="flex flex-wrap gap-2">{[...new Set(sampleRows.map(v=>v.category))].map(v=><button key={v} type="button" onClick={()=>toggle(sampleCategory,v,setSampleCategory)} className={'rounded-full px-3 py-2 text-[11px] font-semibold '+(sampleCategory.includes(v)?'bg-[#FF5500] text-white':'bg-orange-50 text-slate-700')}>{v}</button>)}</div></FilterGroup>}
            {sampleKind==='tours' && <FilterGroup title="Duration">{['Half-Day','Full-Day','Multi-Day'].map(v=>check(v,sampleDuration.includes(v),()=>toggle(sampleDuration,v,setSampleDuration)))}</FilterGroup>}
            {sampleKind==='transfers' && <FilterGroup title="Vehicle type"><div className="flex flex-wrap gap-2">{[...new Set(sampleRows.map(v=>v.category))].map(v=><button key={v} type="button" onClick={()=>toggle(sampleCategory,v,setSampleCategory)} className={'rounded-full px-3 py-2 text-[11px] font-semibold '+(sampleCategory.includes(v)?'bg-[#FF5500] text-white':'bg-orange-50 text-slate-700')}>{v}</button>)}</div></FilterGroup>}
            {query.type==='flights' && <FilterGroup title="Stops">{['Non-stop / Direct','1 Stop','2+ Stops'].map(v=>check(v,stops.includes(v),()=>toggle(stops,v,setStops)))}</FilterGroup>}
            {query.type==='flights' && <FilterGroup title="Baggage">{check('Cabin baggage included',baggage,()=>setBaggage(!baggage))}</FilterGroup>}
{query.type==='hotels' && <FilterGroup title="Star rating"><div className="space-y-1"><button type="button" onClick={()=>setHotelStars([])} aria-pressed={!hotelStars.length} className={'w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold '+(!hotelStars.length?'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-200':'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800')}>All Stars ({hotelInventory.length})</button>{([1,2,3,4,5,7] as const).map(star=>{const count=hotelInventory.filter(h=>h.stars===star).length;const selected=hotelStars.includes(star);const label=star===1?'1 Star Â· Budget':star===2?'2 Stars':star===3?'3 Stars Â· Mid-Range':star===4?'4 Stars Â· Upscale':star===5?'5 Stars Â· Luxury':'7 Stars Â· Ultra-Luxury';return count>0?<button key={star} type="button" onClick={()=>setHotelStars(selected?hotelStars.filter(v=>v!==star):[...hotelStars,star])} aria-pressed={selected} className={'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs '+(selected?'bg-orange-100 font-bold text-orange-800 dark:bg-orange-950/50 dark:text-orange-200':'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800')}><span>{label}</span><span>{count}</span></button>:null})}</div></FilterGroup>}
            {!sampleKind && <FilterGroup title="Maximum price"><div className="flex justify-between text-xs text-slate-600"><span>Up to</span><strong>{money(cap)}</strong></div><input aria-label="Maximum price" type="range" min={Math.min(...deals.map(d=>d.price))} max={max} step="5" value={cap} onChange={e=>setCap(Number(e.target.value))} className="mt-3 w-full accent-[#FF5500]"/></FilterGroup>}
            {query.type==='flights' && <><FilterGroup title="Airlines"><button type="button" onClick={()=>setAirlines([])} aria-pressed={!airlines.length} className="mb-2 w-full rounded-lg bg-orange-50 px-2 py-2 text-left text-xs font-bold text-[#C93400] dark:bg-orange-950/40 dark:text-orange-200">All Airlines ({new Set(deals.map(d=>d.airline).filter(Boolean)).size})</button>{AIRLINES.map(v=>{const count=deals.filter(d=>d.airline===v).length;return count? <div key={v} className="flex items-center justify-between gap-2">{check(v,airlines.includes(v),()=>toggle(airlines,v,setAirlines))}<span className="text-[10px] text-slate-400">{count}</span></div>:null})}</FilterGroup><FilterGroup title="Cabin class">{['Economy','Business','First'].map(v=>check(v,flightCabins.includes(v),()=>toggle(flightCabins,v,setFlightCabins)))}</FilterGroup></>}
            <p className="mt-2 text-[11px] leading-5 text-slate-500">Filters apply to the indicative comparison examples shown here.</p>
          </>}
        </aside>
        <section className="min-w-0">
          {<>
            <div className="mb-4"><h2 className="font-bold text-slate-900 dark:text-white">{sampleKind ? filteredSamples.length : query.type==='hotels'?filteredHotels.length:filtered.length} options to compare</h2><p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Select a provider to continue</p></div>
            {sampleKind ? <div className="mb-4 flex flex-wrap items-center gap-2">{(['Price','Rating'] as const).map(mode=><button key={mode} type="button" onClick={()=>setSampleSort(mode)} aria-pressed={sampleSort===mode} className={'rounded-lg px-3 py-2 text-xs font-bold '+(sampleSort===mode?'bg-[#FF5A00] text-white':'bg-white text-slate-600')}>{mode==='Price'?'Lowest Price':'Top Rated'}</button>)}</div> : query.type==='hotels' ? <div className="mb-4 flex flex-wrap items-center gap-2">{(['Lowest Price','Highest Price','Top Rated','Star Rating'] as const).map(mode=><button key={mode} type="button" onClick={()=>setHotelSort(mode)} aria-pressed={hotelSort===mode} className={'rounded-lg px-3 py-2 text-xs font-bold '+(hotelSort===mode?'bg-[#FF5A00] text-white':'bg-white text-slate-600 hover:bg-orange-50 dark:bg-slate-800 dark:text-slate-200')}>{mode}</button>)}</div> : query.type==='flights' ? <div className="mb-5 grid gap-3 md:grid-cols-3">{(['Cheapest','Fastest','Earliest Departure'] as SortMode[]).map(mode=>{
              const chosen = mode==='Cheapest' ? [...eligibleDeals].sort((a,b)=>a.price-b.price)[0] : mode==='Fastest' ? [...eligibleDeals].sort((a,b)=>a.durationMinutes-b.durationMinutes)[0] : [...eligibleDeals].sort((a,b)=>(a.departureMinutes??0)-(b.departureMinutes??0))[0]
              return <button key={mode} type="button" disabled={!chosen} onClick={()=>setSort(mode)} aria-pressed={sort===mode} className={'group min-h-[150px] rounded-2xl border-2 p-4 text-left shadow-[0_8px_20px_rgba(25,35,55,.09)] transition hover:-translate-y-1 hover:border-[#FF5A00] hover:shadow-[0_14px_28px_rgba(255,90,0,.16)] disabled:opacity-50 '+(sort===mode?'border-[#FF5A00] bg-[#FF5A00] text-white shadow-[0_12px_28px_rgba(255,90,0,.28)]':'border-white bg-white text-slate-900')}>
                <span className="block text-lg font-extrabold">{mode}</span>
                {chosen ? <><span className="mt-1 block text-2xl font-black tracking-tight">{money(chosen.price)}</span><span className={'mt-1 block text-xs font-semibold '+(sort===mode?'text-white/90':'text-slate-500')}>{durationText(chosen.durationMinutes)} ï¿½ {airlineName(chosen)}</span><span className={'mt-3 flex items-center gap-2 text-xs font-bold '+(sort===mode?'text-white':'text-slate-700')}><AirlineLogo name={airlineName(chosen)} size="size-8"/><span>Flight number on partner site</span></span></> : <span className="mt-2 block text-xs">No matching offers</span>}
              </button>
            })}</div> : <div className="mb-4 flex gap-2">{(['Best','Cheapest','Fastest'] as SortMode[]).map(v=><button key={v} onClick={()=>setSort(v)} className={'rounded-lg px-3 py-2 text-xs font-bold '+(sort===v?'bg-[#FF5A00] text-white':'bg-white text-slate-600 hover:bg-orange-50')}>{v}</button>)}</div>}
            <div className="space-y-3">{sampleKind ? (filteredSamples.length ? filteredSamples.map(item=><SampleCard key={item.id} item={item}/>) : <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">No listings match these filters. Reset filters to see all examples.</div>) : query.type==='hotels' ? (filteredHotels.length ? filteredHotels.slice(0,hotelPageSize).map(hotel=><HotelCard key={hotel.id} hotel={hotel} query={query}/>) : <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">No hotels match this star filter. Choose All Stars to see every sample.</div>) : (filtered.length?filtered.map(deal=><OfferCard key={deal.id} deal={deal}/>):<div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">No offers match these filters. Reset your filters to see all options.</div>)}</div>
            {query.type==='hotels' && hotelPageSize<filteredHotels.length && <button type="button" onClick={()=>setHotelPageSize(v=>v+12)} className="mt-5 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-bold text-[#D94700] transition hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-900 dark:text-orange-300">Load More Hotels ({filteredHotels.length-hotelPageSize} remaining)</button>}
            <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4 text-xs leading-5 text-slate-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-100">{sampleKind ? 'Illustrative partner rates - click to verify live availability. Car, tour and transfer listings, ratings, durations, capacities and prices are generated examples, not live inventory or confirmed bookings. Verify final terms and availability with the linked partner.' : query.type==='hotels'?'Hotel cards, ratings, reviews, photos and prices are illustrative guide examples, not a live or verified property catalogue. Each card opens Agoda, Booking.com, Expedia/Hotels.com and Trip.com search pages with destination, dates, guests and rooms pre-filled. Marker 806576 is included in each direct URL, but Travelpayouts attribution requires the corresponding brand programme and Partner Links API conversion. Confirm live properties, taxes, room terms and availability on the provider site.':query.type==='flights'?'Flight options are generated illustrative fare estimatesâ€”not live GDS/API inventory, confirmed schedules or ticket prices. Check current schedules, baggage, cabin and final fare with the airline or booking partner.':'Trexifly currently displays illustrative comparison estimates, not live inventory. These are not guaranteed fares, room rates or vehicle availability. Confirm the final price, taxes, terms and availability with the booking provider before paying.'}</div>
          </>}
        </section>
      </div>
    </div>
  </div>
}
