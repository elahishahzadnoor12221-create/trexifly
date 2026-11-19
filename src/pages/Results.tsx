import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Icon } from '../components/Icons'
import { SearchWidget } from '../components/SearchWidget'
import { readQuery, dealsFor, type Deal } from '../lib/data'
import { generateHotelInventory, type HotelListing } from '../lib/hotels'
import { getAffiliatePartners } from '../lib/affiliates'
import { usePrefs } from '../lib/prefs'
import { imgFallback } from '../lib/imageFallback'


function HotelCard({ hotel, city }: { hotel: HotelListing; city: string }) {
  const { money } = usePrefs()
  const [saved, setSaved] = useState(false)
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-xl bg-orange-50 md:h-auto md:w-60 dark:bg-slate-800">
          <img src={hotel.photoUrl} alt={`${hotel.title} sample photo in ${city}`} loading="lazy" onError={imgFallback} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
          <button type="button" onClick={() => setSaved(!saved)} aria-label="Save property" className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm">
            <span className={saved ? 'text-[#FF5500]' : 'text-slate-500'}>{saved ? '♥' : '♡'}</span>
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{hotel.title}</h3>
              <span className="text-xs font-bold text-amber-500">{hotel.stars}★</span>
              <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#C93400] dark:bg-orange-950/40 dark:text-orange-300">Sample listing</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-[#FF5500]">{city} · <span className="font-normal text-slate-500">{hotel.neighborhood}</span></p>
            <p className="mt-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">{hotel.address}</p>
            <div className="mt-2 space-y-1 text-xs">
              <p className="font-semibold text-slate-600 dark:text-slate-300">{hotel.subtitle}</p>
              <p className="text-slate-500">Illustrative rating: {hotel.score.toFixed(1)}/10 · {hotel.reviews.toLocaleString()} simulated reviews</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {hotel.perks.map(perk => <span key={perk} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{perk}</span>)}
              </div>
            </div>
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
            <p className="text-[10px] text-slate-500">Illustrative estimate only</p>
            <a href={hotel.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored" className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#FF5500] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#E64A00]">View booking partner <span>↗</span></a>
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
        <div className="sm:text-right"><p className="text-[11px] text-slate-500">{deal.priceUnit}</p><p className="text-2xl font-bold tracking-tight text-slate-900">{money(deal.price)}</p><p className="text-[10px] text-slate-500">Indicative estimate</p>{deal.title.includes(" � ") && <p className="mt-1 text-[10px] text-slate-500">Flight number shown on partner site</p>}</div>
        <a href={deal.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#FF5500] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#E64A00]">View Deal <Icon name="arrowUpRight" className="size-4"/></a>
      </div>
    </div>
  </article>
}
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
  const deals = transfer ? [] : dealsFor(query)
  const hotelInventory = query.type === 'hotels' && !transfer ? generateHotelInventory(query) : []
  const partnerLinks = getAffiliatePartners(transfer ? 'transfers' : query.type)
  const { money } = usePrefs()
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
  const toggle=(list:string[],value:string,setter:(v:string[])=>void)=>setter(list.includes(value)?list.filter(v=>v!==value):[...list,value])
  const eligibleDeals=useMemo(()=>deals.filter(d=>d.price<=cap).filter(d=>!stops.length||stops.includes(d.stopsCount===0?'Non-stop / Direct':d.stopsCount===1?'1 Stop':'2+ Stops')).filter(d=>!airlines.length||airlines.includes(d.airline ?? airlineName(d))).filter(d=>!flightCabins.length||flightCabins.includes(d.cabinClass ?? 'Economy')).filter(d=>!baggage||d.perks.some(p=>/bag/i.test(p))),[deals,cap,stops,airlines,flightCabins,baggage])
  const filtered=useMemo(()=>[...eligibleDeals].sort((a,b)=>sort==='Cheapest'?a.price-b.price:sort==='Fastest'?a.durationMinutes-b.durationMinutes:sort==='Earliest Departure'?(a.departureMinutes??0)-(b.departureMinutes??0):b.score-a.score),[eligibleDeals,sort])
  const filteredHotels=useMemo(()=>{const rows=hotelInventory.filter(h=>!hotelStars.length||hotelStars.includes(h.stars));return [...rows].sort((a,b)=>hotelSort==='Lowest Price'?a.price-b.price:hotelSort==='Highest Price'?b.price-a.price:hotelSort==='Top Rated'?b.score-a.score:b.stars-a.stars)},[hotelInventory,hotelStars,hotelSort])
  const check=(text:string,checked:boolean,onChange:()=>void)=><label key={text} className="flex cursor-pointer items-center gap-2 py-1.5 text-xs text-slate-700"><input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-[#FF5500]"/>{text}</label>
  const heading=transfer?'Airport transfers':query.type==='hotels'?'Stays in '+query.to:query.type==='cars'?'Car rentals in '+query.from:query.type==='tours'?'Activities in '+query.to:query.from+' ? '+query.to
  return <div className="results-page min-h-screen bg-[#FFF7F2] pb-16 pt-8 dark:bg-slate-950">
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <Link to="/" className="text-xs font-semibold text-[#FF5500] hover:underline">? Back to search</Link>
      <div className="mb-5 mt-3"><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{heading}</h1><p className="mt-1 text-xs text-slate-600">Illustrative estimates only � Final prices and availability must be confirmed with the booking provider.</p></div>
      <div className="mb-6 rounded-xl bg-white p-3 shadow-sm"><SearchWidget initial={query} compact/></div>
      <section aria-label="Official booking partners" className="mb-6 rounded-xl border border-orange-100 bg-white p-4 shadow-sm"><div className="mb-3"><h2 className="font-bold text-slate-900">Official booking partners</h2><p className="mt-1 text-xs text-slate-600">Continue to a Travelpayouts-tracked partner site. Search details may need to be entered again on the partner website.</p></div><div className="flex flex-wrap gap-2">{partnerLinks.map(partner=><a key={partner.id} href={partner.url} target="_blank" rel="noopener noreferrer sponsored" data-affiliate-partner={partner.id} className="inline-flex items-center gap-2 rounded-lg bg-[#FF5500] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#E64A00]">Continue to {partner.name}<Icon name="arrowUpRight" className="size-4"/></a>)}</div></section>
      <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          {transfer ? <><h2 className="font-bold text-slate-900">Airport transfer search</h2><p className="mt-2 text-xs leading-5 text-slate-600">Your pickup, destination, date and passenger details are retained here. Choose one of the official transfer partners to continue on its booking site.</p></> : <>
            <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-slate-900">Filter by</h2><button onClick={()=>{setCap(max);setStops([]);setAirlines([]);setBaggage(false);setHotelStars([]);setHotelPageSize(12);setFlightCabins([])}} className="text-xs font-semibold text-[#FF5500]">Reset</button></div>
            {query.type==='flights' && <FilterGroup title="Stops">{['Non-stop / Direct','1 Stop','2+ Stops'].map(v=>check(v,stops.includes(v),()=>toggle(stops,v,setStops)))}</FilterGroup>}
            {query.type==='flights' && <FilterGroup title="Baggage">{check('Cabin baggage included',baggage,()=>setBaggage(!baggage))}</FilterGroup>}
{query.type==='hotels' && <FilterGroup title="Star rating"><div className="space-y-1"><button type="button" onClick={()=>setHotelStars([])} aria-pressed={!hotelStars.length} className={'w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold '+(!hotelStars.length?'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-200':'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800')}>All Stars ({hotelInventory.length})</button>{([1,2,3,4,5,7] as const).map(star=>{const count=hotelInventory.filter(h=>h.stars===star).length;const selected=hotelStars.includes(star);const label=star===1?'1 Star · Budget':star===2?'2 Stars':star===3?'3 Stars · Mid-Range':star===4?'4 Stars · Upscale':star===5?'5 Stars · Luxury':'7 Stars · Ultra-Luxury';return count>0?<button key={star} type="button" onClick={()=>setHotelStars(selected?hotelStars.filter(v=>v!==star):[...hotelStars,star])} aria-pressed={selected} className={'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs '+(selected?'bg-orange-100 font-bold text-orange-800 dark:bg-orange-950/50 dark:text-orange-200':'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800')}><span>{label}</span><span>{count}</span></button>:null})}</div></FilterGroup>}
            <FilterGroup title="Maximum price"><div className="flex justify-between text-xs text-slate-600"><span>Up to</span><strong>{money(cap)}</strong></div><input aria-label="Maximum price" type="range" min={Math.min(...deals.map(d=>d.price))} max={max} step="5" value={cap} onChange={e=>setCap(Number(e.target.value))} className="mt-3 w-full accent-[#FF5500]"/></FilterGroup>
            {query.type==='flights' && <><FilterGroup title="Airlines"><button type="button" onClick={()=>setAirlines([])} aria-pressed={!airlines.length} className="mb-2 w-full rounded-lg bg-orange-50 px-2 py-2 text-left text-xs font-bold text-[#C93400] dark:bg-orange-950/40 dark:text-orange-200">All Airlines ({new Set(deals.map(d=>d.airline).filter(Boolean)).size})</button>{AIRLINES.map(v=>{const count=deals.filter(d=>d.airline===v).length;return count? <div key={v} className="flex items-center justify-between gap-2">{check(v,airlines.includes(v),()=>toggle(airlines,v,setAirlines))}<span className="text-[10px] text-slate-400">{count}</span></div>:null})}</FilterGroup><FilterGroup title="Cabin class">{['Economy','Business','First'].map(v=>check(v,flightCabins.includes(v),()=>toggle(flightCabins,v,setFlightCabins)))}</FilterGroup></>}
            <p className="mt-2 text-[11px] leading-5 text-slate-500">Filters apply to the indicative comparison examples shown here.</p>
          </>}
        </aside>
        <section className="min-w-0">
          {transfer ? <div className="rounded-xl border border-orange-100 bg-white p-8"><span className="inline-flex size-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF5500]"><Icon name="car" className="size-5"/></span><h2 className="mt-4 text-lg font-bold text-slate-900">Choose an airport transfer partner</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Your route details are ready. Select Kiwitaxi or GetTransfer.com above to open its official tracked booking page. Final vehicle options, prices and availability are provided by the partner.</p><Link to="/?tab=transfers#search-widget" className="mt-5 inline-flex rounded-lg bg-[#FF5500] px-4 py-2.5 text-sm font-bold text-white">Edit transfer search</Link></div> : <>
            <div className="mb-4"><h2 className="font-bold text-slate-900 dark:text-white">{query.type==='hotels'?filteredHotels.length:filtered.length} options to compare</h2><p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Select a provider to continue</p></div>
            {query.type==='hotels' ? <div className="mb-4 flex flex-wrap items-center gap-2">{(['Lowest Price','Highest Price','Top Rated','Star Rating'] as const).map(mode=><button key={mode} type="button" onClick={()=>setHotelSort(mode)} aria-pressed={hotelSort===mode} className={'rounded-lg px-3 py-2 text-xs font-bold '+(hotelSort===mode?'bg-[#FF5A00] text-white':'bg-white text-slate-600 hover:bg-orange-50 dark:bg-slate-800 dark:text-slate-200')}>{mode}</button>)}</div> : query.type==='flights' ? <div className="mb-5 grid gap-3 md:grid-cols-3">{(['Cheapest','Fastest','Earliest Departure'] as SortMode[]).map(mode=>{
              const chosen = mode==='Cheapest' ? [...eligibleDeals].sort((a,b)=>a.price-b.price)[0] : mode==='Fastest' ? [...eligibleDeals].sort((a,b)=>a.durationMinutes-b.durationMinutes)[0] : [...eligibleDeals].sort((a,b)=>(a.departureMinutes??0)-(b.departureMinutes??0))[0]
              return <button key={mode} type="button" disabled={!chosen} onClick={()=>setSort(mode)} aria-pressed={sort===mode} className={'group min-h-[150px] rounded-2xl border-2 p-4 text-left shadow-[0_8px_20px_rgba(25,35,55,.09)] transition hover:-translate-y-1 hover:border-[#FF5A00] hover:shadow-[0_14px_28px_rgba(255,90,0,.16)] disabled:opacity-50 '+(sort===mode?'border-[#FF5A00] bg-[#FF5A00] text-white shadow-[0_12px_28px_rgba(255,90,0,.28)]':'border-white bg-white text-slate-900')}>
                <span className="block text-lg font-extrabold">{mode}</span>
                {chosen ? <><span className="mt-1 block text-2xl font-black tracking-tight">{money(chosen.price)}</span><span className={'mt-1 block text-xs font-semibold '+(sort===mode?'text-white/90':'text-slate-500')}>{durationText(chosen.durationMinutes)} � {airlineName(chosen)}</span><span className={'mt-3 flex items-center gap-2 text-xs font-bold '+(sort===mode?'text-white':'text-slate-700')}><AirlineLogo name={airlineName(chosen)} size="size-8"/><span>Flight number on partner site</span></span></> : <span className="mt-2 block text-xs">No matching offers</span>}
              </button>
            })}</div> : <div className="mb-4 flex gap-2">{(['Best','Cheapest','Fastest'] as SortMode[]).map(v=><button key={v} onClick={()=>setSort(v)} className={'rounded-lg px-3 py-2 text-xs font-bold '+(sort===v?'bg-[#FF5A00] text-white':'bg-white text-slate-600 hover:bg-orange-50')}>{v}</button>)}</div>}
            <div className="space-y-3">{query.type==='hotels' ? (filteredHotels.length ? filteredHotels.slice(0,hotelPageSize).map(hotel=><HotelCard key={hotel.id} hotel={hotel} city={query.to}/>) : <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">No hotels match this star filter. Choose All Stars to see every sample.</div>) : (filtered.length?filtered.map(deal=><OfferCard key={deal.id} deal={deal}/>):<div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">No offers match these filters. Reset your filters to see all options.</div>)}</div>
            {query.type==='hotels' && hotelPageSize<filteredHotels.length && <button type="button" onClick={()=>setHotelPageSize(v=>v+12)} className="mt-5 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-bold text-[#D94700] transition hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-900 dark:text-orange-300">Load More Hotels ({filteredHotels.length-hotelPageSize} remaining)</button>}
            <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4 text-xs leading-5 text-slate-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-100">{query.type==='hotels'?'Hotel cards are generated sample listings, not a live or verified property catalogue. Hotellook/Travelpayouts hotel APIs were discontinued; displayed ratings, reviews, photos and prices are illustrative only. Use the booking partner to search real properties, current rates and availability.':query.type==='flights'?'Flight options are generated illustrative fare estimates—not live GDS/API inventory, confirmed schedules or ticket prices. Check current schedules, baggage, cabin and final fare with the airline or booking partner.':'Trexifly currently displays illustrative comparison estimates, not live inventory. These are not guaranteed fares, room rates or vehicle availability. Confirm the final price, taxes, terms and availability with the booking provider before paying.'}</div>
          </>}
        </section>
      </div>
    </div>
  </div>
}
