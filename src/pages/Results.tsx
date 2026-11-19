import { useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Icon } from '../components/Icons'
import { SearchWidget } from '../components/SearchWidget'
import { readQuery, dealsFor, type Deal } from '../lib/data'
import { getAffiliatePartners } from '../lib/affiliates'
import { usePrefs } from '../lib/prefs'
import { imgFallback } from '../lib/imageFallback'

const HOTEL_PHOTOS = [
  'photo-1566073771259-6a8506099945',
  'photo-1582719508461-905c673771fd',
  'photo-1542314831-068cd1dbfeeb',
  'photo-1520250497591-112f2f40a3f4',
  'photo-1551882547-ff40c63fe5fa',
  'photo-1571896349842-33c89424de2d',
  'photo-1564501049412-61c2a3083791',
  'photo-1445019980597-93fa8acb246c',
]

function HotelCard({ deal, index, city }: { deal: Deal; index: number; city: string }) {
  const { money } = usePrefs()
  const [saved, setSaved] = useState(false)
  const stars = deal.score >= 92 ? 5 : deal.score >= 82 ? 4 : 3
  const reviewScore = Math.min(9.6, Math.max(7.4, Number((deal.score / 10).toFixed(1))))
  const reviewLabel = reviewScore >= 9.0 ? 'Wonderful' : reviewScore >= 8.5 ? 'Excellent' : reviewScore >= 8.0 ? 'Very Good' : 'Good'
  const reviewsCount = 420 + ((index * 317 + deal.price * 13) % 2800)
  const photoId = HOTEL_PHOTOS[index % HOTEL_PHOTOS.length]

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-xl bg-orange-50 md:h-auto md:w-60">
          <img src={`https://unsplash.com{photoId}?auto=format&fit=crop&w=800&q=85`} alt={deal.title} loading="lazy" onError={imgFallback} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
          <button type="button" onClick={() => setSaved(!saved)} aria-label="Save property" className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm">
            <span className={saved ? 'text-[#FF5500]' : 'text-slate-500'}>{saved ? '♥' : '♡'}</span>
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900">{deal.title}</h3>
              <span className="text-xs text-amber-500">{'★'.repeat(stars)}</span>
              <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#C93400]">Featured</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-[#FF5500]">{city} · <span className="font-normal text-slate-500">Central location · Easy access</span></p>
            <p className="mt-2.5 text-xs font-bold text-slate-800">{deal.subtitle}</p>
            <div className="mt-2 space-y-1 text-xs">
              <p className="font-semibold text-emerald-700">✓ Breakfast included</p>
              <p className="font-semibold text-emerald-700">✓ Free cancellation · No prepayment needed</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {deal.perks.map(perk => <span key={perk} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{perk}</span>)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-end justify-between border-t border-slate-100 pt-3 md:w-48 md:shrink-0 md:flex-col md:border-l md:border-t-0 md:pl-4 md:pt-0">
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="text-xs font-bold text-slate-900">{reviewLabel}</p>
              <p className="text-[11px] text-slate-500">{reviewsCount.toLocaleString()} reviews</p>
            </div>
            <span className="grid size-8 place-items-center rounded-lg rounded-bl-none bg-[#1E293B] text-xs font-extrabold text-white">{reviewScore.toFixed(1)}</span>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-500">{deal.priceUnit}</p>
            <p className="text-2xl font-black tracking-tight text-slate-900">{money(deal.price)}</p>
            <p className="text-[10px] text-slate-500">Indicative estimate</p>
            <a href={deal.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored" className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#FF5500] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#E64A00]">
              See availability <span>›</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

type SortMode = 'Best' | 'Cheapest' | 'Fastest'
const AIRLINE_CODES: Record<string, string> = {
  'Emirates':'EK', 'PIA':'PK', 'flydubai':'FZ', 'Airblue':'PA',
  'Gulf Air':'GF', 'Etihad':'EY', 'Qatar Airways':'QR',
  'Turkish Airlines':'TK', 'Saudia':'SV', 'Thai Airways':'TG',
}
function airlineName(deal: Deal) { return deal.title.split(' · ')[0] }
function durationText(minutes: number) { return Math.floor(minutes/60)+'h '+String(minutes%60).padStart(2,'0')+'m' }
function AirlineLogo({ name, size='size-10' }: { name: string; size?: string }) {
  const [failed,setFailed] = useState(false)
  const code = AIRLINE_CODES[name]
  return <span className={'grid '+size+' shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-sm'}>
    {code && !failed ? <img src={'https://www.gstatic.com/flights/airline_logos/70px/'+code+'.png'} alt="" loading="lazy" className="max-h-full max-w-full object-contain" onError={()=>setFailed(true)}/> : <span aria-label={name} className="text-xs font-extrabold text-[#D94700]">{name.split(/\s+/).map(v=>v[0]).join('').slice(0,3).toUpperCase()}</span>}
  </span>
}
const AIRLINES = ['Emirates', 'Qatar Airways', 'PIA', 'flydubai', 'Airblue', 'Gulf Air', 'Etihad', 'Turkish Airlines', 'Saudia', 'Thai Airways']
function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border-t border-slate-200 py-4"><h3 className="mb-2 text-sm font-bold text-slate-900">{title}</h3>{children}</section>
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
        <a href={deal.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#FF5500] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#E64A00]">View Deal <Icon name="arrowUpRight" className="size-4"/></a>
      </div>
    </div>
  </article>
}
export function Results() {
  const [params] = useSearchParams()
  const query = readQuery(params)
  const transfer = params.get('service') === 'airport-transfer'
  const deals = transfer ? [] : dealsFor(query)
  const partnerLinks = getAffiliatePartners(transfer ? 'transfers' : query.type)
  const { money } = usePrefs()
  const max = deals.length ? Math.max(...deals.map(d=>d.price)) : 0
  const [cap,setCap] = useState(max)
  const [stops,setStops] = useState<string[]>([])
  const [airlines,setAirlines] = useState<string[]>([])
  const [baggage,setBaggage] = useState(false)
  const [sort,setSort] = useState<SortMode>('Best')
  const toggle=(list:string[],value:string,setter:(v:string[])=>void)=>setter(list.includes(value)?list.filter(v=>v!==value):[...list,value])
  const eligibleDeals=useMemo(()=>deals.filter(d=>d.price<=cap).filter(d=>!stops.length||stops.includes(d.direct?'Non-stop':'1 stop')).filter(d=>!airlines.length||airlines.some(a=>d.title.toLowerCase().includes(a.toLowerCase()))).filter(d=>!baggage||d.perks.some(p=>/bag/i.test(p))),[deals,cap,stops,airlines,baggage])
  const filtered=useMemo(()=>[...eligibleDeals].sort((a,b)=>sort==='Cheapest'?a.price-b.price:sort==='Fastest'?a.durationMinutes-b.durationMinutes:b.score-a.score),[eligibleDeals,sort])
  const check=(text:string,checked:boolean,onChange:()=>void)=><label key={text} className="flex cursor-pointer items-center gap-2 py-1.5 text-xs text-slate-700"><input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-[#FF5500]"/>{text}</label>
  const heading=transfer?'Airport transfers':query.type==='hotels'?'Stays in '+query.to:query.type==='cars'?'Car rentals in '+query.from:query.type==='tours'?'Activities in '+query.to:query.from+' → '+query.to
  return <div className="min-h-screen bg-[#FFF7F2] pb-16 pt-8">
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <Link to="/" className="text-xs font-semibold text-[#FF5500] hover:underline">← Back to search</Link>
      <div className="mb-5 mt-3"><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{heading}</h1><p className="mt-1 text-xs text-slate-600">Illustrative estimates only · Final prices and availability must be confirmed with the booking provider.</p></div>
      <div className="mb-6 rounded-xl bg-white p-3 shadow-sm"><SearchWidget initial={query} compact/></div>
      <section aria-label="Official booking partners" className="mb-6 rounded-xl border border-orange-100 bg-white p-4 shadow-sm"><div className="mb-3"><h2 className="font-bold text-slate-900">Official booking partners</h2><p className="mt-1 text-xs text-slate-600">Continue to a Travelpayouts-tracked partner site. Search details may need to be entered again on the partner website.</p></div><div className="flex flex-wrap gap-2">{partnerLinks.map(partner=><a key={partner.id} href={partner.url} target="_blank" rel="noopener noreferrer sponsored" data-affiliate-partner={partner.id} className="inline-flex items-center gap-2 rounded-lg bg-[#FF5500] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#E64A00]">Continue to {partner.name}<Icon name="arrowUpRight" className="size-4"/></a>)}</div></section>
      <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-slate-200 bg-white p-4">
          {transfer ? <><h2 className="font-bold text-slate-900">Airport transfer search</h2><p className="mt-2 text-xs leading-5 text-slate-600">Your pickup, destination, date and passenger details are retained here. Choose one of the official transfer partners to continue on its booking site.</p></> : <>
            <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-slate-900">Filter by</h2><button onClick={()=>{setCap(max);setStops([]);setAirlines([]);setBaggage(false)}} className="text-xs font-semibold text-[#FF5500]">Reset</button></div>
            {query.type==='flights' && <FilterGroup title="Stops">{['Non-stop','1 stop'].map(v=>check(v,stops.includes(v),()=>toggle(stops,v,setStops)))}</FilterGroup>}
            {query.type==='flights' && <FilterGroup title="Baggage">{check('Cabin baggage included',baggage,()=>setBaggage(!baggage))}</FilterGroup>}
{query.type==='hotels' && <FilterGroup title="Popular filters"><p className='py-1 text-xs font-semibold text-emerald-700'>✓ Free cancellation</p><p className='py-1 text-xs font-semibold text-emerald-700'>✓ Breakfast included</p><p className='py-1 text-xs text-slate-700'>★ 4 & 5 Star Properties</p></FilterGroup>}
            <FilterGroup title="Maximum price"><div className="flex justify-between text-xs text-slate-600"><span>Up to</span><strong>{money(cap)}</strong></div><input aria-label="Maximum price" type="range" min={Math.min(...deals.map(d=>d.price))} max={max} step="5" value={cap} onChange={e=>setCap(Number(e.target.value))} className="mt-3 w-full accent-[#FF5500]"/></FilterGroup>
            {query.type==='flights' && <FilterGroup title="Airlines">{AIRLINES.map(v=>check(v,airlines.includes(v),()=>toggle(airlines,v,setAirlines)))}</FilterGroup>}
            <p className="mt-2 text-[11px] leading-5 text-slate-500">Filters apply to the indicative comparison examples shown here.</p>
          </>}
        </aside>
        <section className="min-w-0">
          {transfer ? <div className="rounded-xl border border-orange-100 bg-white p-8"><span className="inline-flex size-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF5500]"><Icon name="car" className="size-5"/></span><h2 className="mt-4 text-lg font-bold text-slate-900">Choose an airport transfer partner</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Your route details are ready. Select Kiwitaxi or GetTransfer.com above to open its official tracked booking page. Final vehicle options, prices and availability are provided by the partner.</p><Link to="/?tab=transfers#search-widget" className="mt-5 inline-flex rounded-lg bg-[#FF5500] px-4 py-2.5 text-sm font-bold text-white">Edit transfer search</Link></div> : <>
            <div className="mb-4"><h2 className="font-bold text-slate-900">{filtered.length} options to compare</h2><p className="mt-1 text-xs text-slate-600">Select a provider to continue</p></div>
            {query.type==='flights' ? <div className="mb-5 grid gap-3 md:grid-cols-3">{(['Best','Cheapest','Fastest'] as SortMode[]).map(mode=>{
              const chosen = mode==='Cheapest' ? [...eligibleDeals].sort((a,b)=>a.price-b.price)[0] : mode==='Fastest' ? [...eligibleDeals].sort((a,b)=>a.durationMinutes-b.durationMinutes)[0] : [...eligibleDeals].sort((a,b)=>b.score-a.score)[0]
              return <button key={mode} type="button" disabled={!chosen} onClick={()=>setSort(mode)} aria-pressed={sort===mode} className={'group min-h-[150px] rounded-2xl border-2 p-4 text-left shadow-[0_8px_20px_rgba(25,35,55,.09)] transition hover:-translate-y-1 hover:border-[#FF5A00] hover:shadow-[0_14px_28px_rgba(255,90,0,.16)] disabled:opacity-50 '+(sort===mode?'border-[#FF5A00] bg-[#FF5A00] text-white shadow-[0_12px_28px_rgba(255,90,0,.28)]':'border-white bg-white text-slate-900')}>
                <span className="block text-lg font-extrabold">{mode}</span>
                {chosen ? <><span className="mt-1 block text-2xl font-black tracking-tight">{money(chosen.price)}</span><span className={'mt-1 block text-xs font-semibold '+(sort===mode?'text-white/90':'text-slate-500')}>{durationText(chosen.durationMinutes)} · {airlineName(chosen)}</span><span className={'mt-3 flex items-center gap-2 text-xs font-bold '+(sort===mode?'text-white':'text-slate-700')}><AirlineLogo name={airlineName(chosen)} size="size-8"/><span>Flight number on partner site</span></span></> : <span className="mt-2 block text-xs">No matching offers</span>}
              </button>
            })}</div> : <div className="mb-4 flex gap-2">{(['Best','Cheapest','Fastest'] as SortMode[]).map(v=><button key={v} onClick={()=>setSort(v)} className={'rounded-lg px-3 py-2 text-xs font-bold '+(sort===v?'bg-[#FF5A00] text-white':'bg-white text-slate-600 hover:bg-orange-50')}>{v}</button>)}</div>}
            <div className="space-y-3">{filtered.length?filtered.map((deal,idx)=>query.type==='hotels'?<HotelCard key={deal.id} deal={deal} index={idx} city={query.to}/>:<OfferCard key={deal.id} deal={deal}/>):<div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">No offers match these filters. Reset your filters to see all options.</div>}</div>
            <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4 text-xs leading-5 text-slate-700">Trexifly currently displays illustrative comparison estimates, not live inventory. These are not guaranteed fares, room rates or vehicle availability. Confirm the final price, taxes, terms and availability with the booking provider before paying.</div>
          </>}
        </section>
      </div>
    </div>
  </div>
}

