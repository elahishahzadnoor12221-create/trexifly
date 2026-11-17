import { useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Icon } from '../components/Icons'
import { SearchWidget } from '../components/SearchWidget'
import { readQuery, dealsFor, type Deal } from '../lib/data'
import { usePrefs } from '../lib/prefs'

type SortMode = 'Best' | 'Cheapest' | 'Fastest'
const AIRLINES = ['Emirates', 'PIA', 'flydubai', 'Airblue', 'Gulf Air', 'Etihad']
function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border-t border-slate-200 py-4"><h3 className="mb-2 text-sm font-bold text-slate-900">{title}</h3>{children}</section>
}
function OfferCard({ deal }: { deal: Deal }) {
  const { money } = usePrefs()
  return <article className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-md sm:p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#FFF0E6] text-sm font-extrabold text-[#D94700]">{deal.title.slice(0,2).toUpperCase()}</div>
        <div className="min-w-0"><p className="font-bold text-slate-900">{deal.title}</p><p className="mt-1 text-xs text-slate-600">{deal.subtitle}</p><div className="mt-2 flex flex-wrap gap-2">{deal.perks.map(perk=><span key={perk} className="rounded-full bg-[#FFF7F2] px-2.5 py-1 text-[10px] font-medium text-slate-600">{perk}</span>)}</div></div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:min-w-[190px] sm:justify-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <div className="sm:text-right"><p className="text-[11px] text-slate-500">{deal.priceUnit}</p><p className="text-2xl font-bold tracking-tight text-slate-900">{money(deal.price)}</p><p className="text-[10px] text-slate-500">Indicative estimate</p></div>
        <a href={deal.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#FF5500] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#E64A00]">See availability / Book <Icon name="arrowUpRight" className="size-4"/></a>
      </div>
    </div>
  </article>
}
export function Results() {
  const [params] = useSearchParams()
  const query = readQuery(params)
  const transfer = params.get('service') === 'airport-transfer'
  const deals = transfer ? [] : dealsFor(query)
  const { money } = usePrefs()
  const max = deals.length ? Math.max(...deals.map(d=>d.price)) : 0
  const [cap,setCap] = useState(max)
  const [stops,setStops] = useState<string[]>([])
  const [airlines,setAirlines] = useState<string[]>([])
  const [baggage,setBaggage] = useState(false)
  const [sort,setSort] = useState<SortMode>('Best')
  const toggle=(list:string[],value:string,setter:(v:string[])=>void)=>setter(list.includes(value)?list.filter(v=>v!==value):[...list,value])
  const filtered=useMemo(()=>deals.filter(d=>d.price<=cap).filter(d=>!stops.length||stops.includes(d.direct?'Non-stop':'1 stop')).filter(d=>!airlines.length||airlines.some(a=>d.title.toLowerCase().includes(a.toLowerCase()))).filter(d=>!baggage||d.perks.some(p=>/bag/i.test(p))).sort((a,b)=>sort==='Cheapest'?a.price-b.price:sort==='Fastest'?a.durationMinutes-b.durationMinutes:b.score-a.score),[deals,cap,stops,airlines,baggage,sort])
  const check=(text:string,checked:boolean,onChange:()=>void)=><label key={text} className="flex cursor-pointer items-center gap-2 py-1.5 text-xs text-slate-700"><input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-[#FF5500]"/>{text}</label>
  const heading=transfer?'Airport transfers':query.type==='hotels'?'Stays in '+query.to:query.type==='cars'?'Car rentals in '+query.from:query.type==='tours'?'Activities in '+query.to:query.from+' → '+query.to
  return <div className="min-h-screen bg-[#FFF7F2] pb-16 pt-8">
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <Link to="/" className="text-xs font-semibold text-[#FF5500] hover:underline">← Back to search</Link>
      <div className="mb-5 mt-3"><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{heading}</h1><p className="mt-1 text-xs text-slate-600">Illustrative estimates only · Final prices and availability must be confirmed with the booking provider.</p></div>
      <div className="mb-6 rounded-xl bg-white p-3 shadow-sm"><SearchWidget initial={query} compact/></div>
      <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-slate-200 bg-white p-4">
          {transfer ? <><h2 className="font-bold text-slate-900">Transfer search</h2><p className="mt-2 text-xs leading-5 text-slate-600">Your route details are ready, but a dedicated airport-transfer booking provider is not connected yet. Trexifly will show transfer offers here once that integration is enabled.</p></> : <>
            <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-slate-900">Filter by</h2><button onClick={()=>{setCap(max);setStops([]);setAirlines([]);setBaggage(false)}} className="text-xs font-semibold text-[#FF5500]">Reset</button></div>
            {query.type==='flights' && <FilterGroup title="Stops">{['Non-stop','1 stop'].map(v=>check(v,stops.includes(v),()=>toggle(stops,v,setStops)))}</FilterGroup>}
            <FilterGroup title="Baggage">{check('Cabin baggage included',baggage,()=>setBaggage(!baggage))}</FilterGroup>
            <FilterGroup title="Maximum price"><div className="flex justify-between text-xs text-slate-600"><span>Up to</span><strong>{money(cap)}</strong></div><input aria-label="Maximum price" type="range" min={Math.min(...deals.map(d=>d.price))} max={max} step="5" value={cap} onChange={e=>setCap(Number(e.target.value))} className="mt-3 w-full accent-[#FF5500]"/></FilterGroup>
            {query.type==='flights' && <FilterGroup title="Airlines">{AIRLINES.map(v=>check(v,airlines.includes(v),()=>toggle(airlines,v,setAirlines)))}</FilterGroup>}
            <p className="mt-2 text-[11px] leading-5 text-slate-500">Filters apply to the indicative comparison examples shown here.</p>
          </>}
        </aside>
        <section className="min-w-0">
          {transfer ? <div className="rounded-xl border border-orange-100 bg-white p-8"><span className="inline-flex size-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF5500]"><Icon name="car" className="size-5"/></span><h2 className="mt-4 text-lg font-bold text-slate-900">Airport transfer provider connection pending</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">We have not connected a live transfer inventory provider yet, so we will not show made-up vehicle prices or booking links. Your selected pickup, destination, date and passenger details are retained in this search.</p><Link to="/?tab=transfers#search-widget" className="mt-5 inline-flex rounded-lg bg-[#FF5500] px-4 py-2.5 text-sm font-bold text-white">Edit transfer search</Link></div> : <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">{filtered.length} options to compare</h2><p className="mt-1 text-xs text-slate-600">Select a provider to continue</p></div><div className="flex rounded-lg border border-slate-200 bg-white p-1">{(['Best','Cheapest','Fastest'] as SortMode[]).map(v=><button key={v} onClick={()=>setSort(v)} className={`rounded-md px-3 py-2 text-xs font-bold ${sort===v?'bg-[#D94700] text-white':'text-slate-600 hover:bg-slate-100'}`}>{v}</button>)}</div></div>
            <div className="space-y-3">{filtered.length?filtered.map(deal=><OfferCard key={deal.id} deal={deal}/>):<div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">No offers match these filters. Reset your filters to see all options.</div>}</div>
            <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4 text-xs leading-5 text-slate-700">Trexifly currently displays illustrative comparison estimates, not live inventory. These are not guaranteed fares, room rates or vehicle availability. Confirm the final price, taxes, terms and availability with the booking provider before paying.</div>
          </>}
        </section>
      </div>
    </div>
  </div>
}
