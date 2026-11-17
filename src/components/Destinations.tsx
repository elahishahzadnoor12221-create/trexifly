import { useEffect, useMemo, useState } from 'react'
import { Icon } from './Icons'

type Region = 'Northern Pakistan' | 'Middle East & Umrah' | 'Europe & UK' | 'Americas' | 'Asia-Pacific' | 'Africa & Oceania'
type Place = { name: string; country: string; region: Region; image: string; caption: string }
const FILTERS = ['All Worldwide','Northern Areas of Pakistan','Middle East & Umrah','Europe & UK','North & South America','Asia-Pacific','Africa & Oceania'] as const
const regionFor = (filter: typeof FILTERS[number]): Region | 'all' => ({
  'All Worldwide':'all','Northern Areas of Pakistan':'Northern Pakistan','Middle East & Umrah':'Middle East & Umrah',
  'Europe & UK':'Europe & UK','North & South America':'Americas','Asia-Pacific':'Asia-Pacific','Africa & Oceania':'Africa & Oceania'
}[filter] as Region | 'all')
const PLACES: Place[] = [
  ...[['Hunza','Pakistan','photo-1544735716-392fe2489ffa','Karakoram peaks and valley stays'],['Skardu','Pakistan','photo-1589553416260-f586c8f1514f','Lakes and mountain adventures'],['Swat','Pakistan','photo-1562602833-0f4ab2fc46e3','Green valleys and rivers'],['Naran Kaghan','Pakistan','photo-1500530855697-b586d89ba3ee','Alpine lakes and scenic roads'],['Gilgit','Pakistan','photo-1500534623283-312aade485b7','Gateway to the mountains'],['Fairy Meadows','Pakistan','photo-1464822759023-fed622ff2c3b','Nanga Parbat views'],['Neelum Valley','Pakistan','photo-1470770841072-f978cf4d019e','Forest and river escapes'],['Chitral','Pakistan','photo-1472396961693-142e6e269027','Hindu Kush landscapes'],['Murree','Pakistan','photo-1501785888041-af3ef285b470','Hill station weekends'],['Lahore','Pakistan','photo-1518005020951-eccb494ad742','Heritage and food'],['Islamabad','Pakistan','photo-1519501025264-65ba15a82390','Capital city and Margalla Hills'],['Karachi','Pakistan','photo-1519046904884-53103b34b206','Coastal city breaks']].map(([name,country,image,caption])=>({name,country,image,caption,region:(['Lahore','Islamabad','Karachi'].includes(name)?'Asia-Pacific':'Northern Pakistan') as Region})),
  ...[['Dubai','United Arab Emirates'],['Jeddah & Makkah','Saudi Arabia'],['Riyadh','Saudi Arabia'],['Doha','Qatar'],['Istanbul','Türkiye'],['Baku','Azerbaijan']].map(([name,country])=>({name,country,region:'Middle East & Umrah' as Region,image:'photo-1512453979798-5ea266f8880c',caption:'City stays and cultural discoveries'})),
  ...[['London','United Kingdom'],['Madrid','Spain'],['Barcelona','Spain'],['Paris','France'],['Rome','Italy']].map(([name,country])=>({name,country,region:'Europe & UK' as Region,image:'photo-1513635269975-59663e0ac1ad',caption:'Culture, landmarks and local experiences'})),
  ...[['Toronto','Canada'],['New York','United States']].map(([name,country])=>({name,country,region:'Americas' as Region,image:'photo-1496442226666-8d4d0e62e6e9',caption:'Iconic skylines and neighbourhoods'})),
  ...[['Tokyo','Japan'],['Singapore','Singapore'],['Kuala Lumpur','Malaysia'],['Bangkok','Thailand']].map(([name,country])=>({name,country,region:'Asia-Pacific' as Region,image:'photo-1540959733332-eab4deaeaafc',caption:'Food, culture and modern city life'})),
  ...[['Cape Town','South Africa'],['Sydney','Australia'],['Auckland','New Zealand']].map(([name,country])=>({name,country,region:'Africa & Oceania' as Region,image:'photo-1506973035872-a4ec16b8e8d9',caption:'Coastlines and outdoor adventures'})),
]
export function Destinations() {
  const [filter,setFilter]=useState<typeof FILTERS[number]>('All Worldwide')
  const [query,setQuery]=useState('')
  const [remote,setRemote]=useState<{name:string;admin1?:string;country?:string}[]>([])
  const [loading,setLoading]=useState(false)
  useEffect(()=>{
    const term=query.trim()
    if(term.length<2){setRemote([]);setLoading(false);return}
    const controller=new AbortController()
    const timer=window.setTimeout(()=>{
      setLoading(true)
      fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(term)+'&count=15&language=en&format=json',{signal:controller.signal})
        .then(r=>r.ok?r.json() as Promise<{results?:{name:string;admin1?:string;country?:string}[]}>:Promise.reject(new Error('Geocoding unavailable')))
        .then(data=>setRemote(data.results??[]))
        .catch(()=>{if(!controller.signal.aborted)setRemote([])})
        .finally(()=>{if(!controller.signal.aborted)setLoading(false)})
    },250)
    return ()=>{window.clearTimeout(timer);controller.abort()}
  },[query])
  const filtered=useMemo(()=>PLACES.filter(p=>(regionFor(filter)==='all'||p.region===regionFor(filter))&&(!query.trim()||[p.name,p.country].join(' ').toLowerCase().includes(query.trim().toLowerCase()))),[filter,query])
  const choose=(name:string,country:string)=>{
    const value=[name,country].filter(Boolean).join(', ')
    window.dispatchEvent(new CustomEvent('trexifly:select-destination',{detail:{destination:value}}))
    document.getElementById('search-widget')?.scrollIntoView({behavior:'smooth',block:'center'})
  }
  return <section id="destinations" className="bg-white py-12 sm:py-16">
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Explore worldwide</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold text-[#242424] sm:text-3xl">Discover destinations around the world</h2><p className="mt-2 text-sm text-slate-600">Explore featured destinations or search the worldwide city directory.</p></div></div>
      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Destination regions">
        {FILTERS.map(item=><button key={item} type="button" role="tab" aria-selected={filter===item} onClick={()=>setFilter(item)} className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${filter===item?'border-[#FF5500] bg-[#FF5500] text-white shadow-md shadow-orange-200':'border-orange-100 bg-white text-slate-700 hover:border-[#FF5500] hover:bg-orange-50'}`}>{item}</button>)}
      </div>
      <div className="relative mt-5 max-w-2xl">
        <label className="flex items-center gap-3 rounded-2xl border-2 border-[#FF5500] bg-white px-4 py-3 shadow-sm"><Icon name="globe" className="size-5 shrink-0 text-[#FF5500]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search any city, country or destination worldwide…" className="w-full bg-transparent text-sm text-[#242424] outline-none" aria-label="Search worldwide destinations"/>{query&&<button type="button" onClick={()=>setQuery('')} aria-label="Clear search" className="text-slate-400"><Icon name="close" className="size-4"/></button>}</label>
        {query.trim().length>=2&&(remote.length>0||loading)&&<div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-orange-100 bg-white p-2 shadow-xl">{remote.map((p,i)=><button key={p.name+i} type="button" onClick={()=>choose(p.name,[p.admin1,p.country].filter(Boolean).join(', '))} className="flex w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-orange-50">{[p.name,p.admin1,p.country].filter(Boolean).join(', ')}</button>)}{loading&&<p className="px-3 py-2 text-xs text-slate-500">Searching worldwide…</p>}</div>}
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {filtered.map(item=><button type="button" key={item.name} onClick={()=>choose(item.name,item.country)} className="group overflow-hidden rounded-xl border border-orange-100 bg-white text-left transition hover:-translate-y-1 hover:border-[#FF5500] hover:shadow-xl hover:shadow-orange-100">
          <div className="relative h-40 overflow-hidden"><img src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=800&q=85`} alt={item.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#C93400]">{item.country}</span></div>
          <div className="p-3.5"><h3 className="font-bold text-[#242424] group-hover:text-[#FF5500]">{item.name}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{item.caption}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#FF5500]">Use destination <Icon name="arrowRight" className="size-3.5"/></span></div>
        </button>)}
      </div>
      {filtered.length===0&&<p className="mt-8 rounded-xl bg-orange-50 p-5 text-sm text-slate-600">No featured destination in this filter. Try the worldwide search above.</p>}
      <p className="mt-4 text-xs text-slate-500">Worldwide directory suggestions use Open-Meteo geocoding. Search results are destination names, not live travel availability.</p>
    </div>
  </section>
}
