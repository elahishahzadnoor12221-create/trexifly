import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { SearchWidget } from '../components/SearchWidget'
import { Destinations } from '../components/Destinations'
import { PromoDeals } from '../components/PromoDeals'
import { WorldGlobe } from '../components/WorldGlobe'
import { Icon } from '../components/Icons'
import { buildAffiliateUrl } from '../lib/affiliates'
// @ts-ignore — provider configuration is intentionally kept as plain JavaScript for easy editing.
import { TRAVEL_PROVIDERS } from '../config/travelProviders.js'

const CAR_DESTINATIONS=['Dubai','London','New York','Istanbul','Riyadh','Lahore','Auckland','Toronto']
const SHOWCASE_CARS=[
  {name:'Toyota Yaris',category:'Economy Hatchback',price:16,supplier:'Europcar',rating:'8.6',photo:'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85'},
  {name:'Toyota Camry',category:'Mid-size Sedan',price:30,supplier:'Hertz',rating:'8.4',photo:'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=85'},
  {name:'MG ZS / Hyundai Tucson',category:'SUV & 4x4',price:36,supplier:'Avis',rating:'8.9',photo:'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=85'},
  {name:'Toyota Prado',category:'Full-Size SUV',price:72,supplier:'Sixt',rating:'8.7',photo:'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=85'}
]
const CAR_FALLBACKS={compact:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"%3E%3Crect width="640" height="360" fill="%23f1f5f9"/%3E%3Cpath d="M125 225h390l-28-62q-10-22-36-22H220q-28 0-43 23z" fill="%233b82f6"/%3E%3Cpath d="M220 145h205l-24-48H255z" fill="%23bfdbfe"/%3E%3Ccircle cx="220" cy="238" r="32" fill="%231e293b"/%3E%3Ccircle cx="430" cy="238" r="32" fill="%231e293b"/%3E%3C/svg%3E',sedan:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"%3E%3Crect width="640" height="360" fill="%23f1f5f9"/%3E%3Cpath d="M85 225h470l-35-67q-12-24-42-24H190q-32 0-49 25z" fill="%23475569"/%3E%3Cpath d="M205 138h220l-26-52H245z" fill="%23cbd5e1"/%3E%3Ccircle cx="205" cy="238" r="35" fill="%231e293b"/%3E%3Ccircle cx="445" cy="238" r="35" fill="%231e293b"/%3E%3C/svg%3E',suv:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"%3E%3Crect width="640" height="360" fill="%23f1f5f9"/%3E%3Cpath d="M75 225h490l-35-90q-10-24-40-24H190q-34 0-50 28z" fill="%230f766e"/%3E%3Cpath d="M190 116h260l-20-45H230z" fill="%23ccfbf1"/%3E%3Ccircle cx="195" cy="238" r="39" fill="%231e293b"/%3E%3Ccircle cx="455" cy="238" r="39" fill="%231e293b"/%3E%3C/svg%3E'}

export function Home() {
  const navigate=useNavigate()
  const [confidenceOpen,setConfidenceOpen]=useState(false)
  const [carDestination,setCarDestination]=useState('Dubai')
  const openWorldwide=()=>{window.dispatchEvent(new CustomEvent('trexifly:open-worldwide'));document.getElementById('destinations')?.scrollIntoView({behavior:'smooth',block:'start'})}
  return <div className="home-page">
    <section className="trexifly-home-hero relative isolate overflow-hidden pb-9 pt-7 sm:pb-12 sm:pt-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-0 hidden w-[32%] overflow-hidden bg-[#FF5500] lg:block">
        <div className="absolute -left-24 top-0 h-full w-48 rounded-full bg-white/90 blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,.7fr)]">
        <div className="min-w-0 max-w-4xl"><div className="mb-6 max-w-3xl text-white"><p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-amber-300"><span className="size-2 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b]"/> Global travel metasearch</p><h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Where to next, Explorer? <span className="text-amber-400">Go further.</span></h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Compare flights, stays, car rentals, tours and airport transfers — all in one place.</p></div><SearchWidget/></div>
        <div className="relative hidden min-h-[430px] items-center justify-center lg:flex" aria-label="3D globe and airplane travel illustration">
          <WorldGlobe />
        </div>
      </div>
    </section>
    <section className="border-y border-orange-100 bg-white py-5"><div className="mx-auto grid max-w-[1280px] gap-4 px-4 sm:grid-cols-3 sm:px-6">
      <button type="button" onClick={openWorldwide} className="group flex w-full items-center gap-3 rounded-2xl border border-orange-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#FF5500] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5500]"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#FF5500] text-white shadow-md shadow-orange-200"><Icon name="globe" className="size-6"/></span><span><span className="block text-sm font-bold text-[#172B4D]">Worldwide discovery</span><span className="mt-1 block text-xs leading-5 text-slate-600">Explore destinations and airports across the globe.</span></span><Icon name="arrowRight" className="ml-auto size-4 text-[#FF5500]"/></button>
      <button type="button" onClick={()=>navigate('/results?type=flights')} className="group flex w-full items-center gap-3 rounded-2xl border border-orange-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#FF5500] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5500]"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#FF5500] text-white shadow-md shadow-orange-200"><Icon name="search" className="size-6"/></span><span><span className="block text-sm font-bold text-[#172B4D]">One clear comparison</span><span className="mt-1 block text-xs leading-5 text-slate-600">Review travel options and provider details in one place.</span></span><Icon name="arrowRight" className="ml-auto size-4 text-[#FF5500]"/></button>
      <button type="button" onClick={()=>setConfidenceOpen(true)} className="group flex w-full items-center gap-3 rounded-2xl border border-orange-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#FF5500] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5500]"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#FF5500] text-white shadow-md shadow-orange-200"><Icon name="shieldCheck" className="size-6" strokeWidth={2}/></span><span><span className="block text-sm font-bold text-[#172B4D]">Travel with confidence</span><span className="mt-1 block text-xs leading-5 text-slate-600">Check final prices and booking terms with providers.</span></span><Icon name="arrowRight" className="ml-auto size-4 text-[#FF5500]"/></button>
    </div></section>
    <Destinations/>
    <section className="bg-[#FFF8F3] py-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">QEEQ-style car discovery</p><h2 className="mt-2 text-2xl font-extrabold text-[#172B4D] sm:text-3xl">Top Car Rental Destinations</h2><p className="mt-2 text-sm text-slate-600">Explore sample vehicles by destination, then compare partner offers.</p></div><a href={buildAffiliateUrl('cars',0)} target="_blank" rel="noopener noreferrer sponsored" className="rounded-xl bg-[#FF5500] px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#E64A00]">Compare all car rentals ?</a></div>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">{CAR_DESTINATIONS.map(city=><button key={city} type="button" onClick={()=>setCarDestination(city)} aria-pressed={carDestination===city} className={'shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition '+(carDestination===city?'bg-[#172B4D] text-white shadow':'border border-orange-200 bg-white text-slate-700 hover:border-[#FF5500]')}>{city}</button>)}</div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SHOWCASE_CARS.map((car,index)=><article key={car.name} className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="relative h-40 bg-slate-100"><img src={car.photo} alt={car.name+' rental car'} loading="lazy" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=car.category.includes('SUV')||car.category.includes('4x4')||car.category.includes('Full-Size')?CAR_FALLBACKS.suv:car.category.includes('Sedan')?CAR_FALLBACKS.sedan:CAR_FALLBACKS.compact}} className="h-full w-full object-cover"/><span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#172B4D]">{car.supplier}</span><span className="absolute right-3 top-3 rounded-full bg-[#172B4D]/90 px-2.5 py-1 text-[10px] font-bold text-white">? {car.rating}</span></div><div className="p-4"><h3 className="font-extrabold text-[#172B4D]">{car.name}</h3><p className="mt-1 text-xs text-slate-500">{car.category} ? {carDestination}</p><div className="mt-4 flex items-end justify-between gap-2"><div><p className="text-[10px] text-slate-500">From</p><p className="text-xl font-black text-[#FF5500]">From US$ {car.price}/day</p></div><a href={buildAffiliateUrl('cars',index%2)} target="_blank" rel="noopener noreferrer sponsored" className="rounded-lg border border-orange-200 px-3 py-2 text-[11px] font-bold text-[#D94700] hover:bg-orange-50">Check rates ?</a></div><p className="mt-3 text-[10px] text-slate-500">Illustrative partner rates ? verify live availability</p></div></article>)}
          <a href={buildAffiliateUrl('cars',1)} target="_blank" rel="noopener noreferrer sponsored" className="flex min-h-[290px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#FF9A65] bg-white p-6 text-center transition hover:border-[#FF5500] hover:bg-orange-50"><span className="grid size-14 place-items-center rounded-2xl bg-orange-100 text-[#FF5500]"><Icon name="car" className="size-7"/></span><h3 className="mt-4 text-lg font-extrabold text-[#172B4D]">Compare All Cars</h3><p className="mt-2 text-xs leading-5 text-slate-600">View more vehicle classes and partner offers in {carDestination}.</p><span className="mt-5 rounded-xl bg-[#FF5500] px-4 py-3 text-xs font-bold text-white">View more cars ?</span><span className="mt-3 text-[10px] text-slate-500">QEEQ ? AutoEurope</span></a>
        </div>
        <p className="mt-4 text-[10px] text-slate-500">All displayed vehicle names, supplier badges, ratings and daily prices are illustrative examples, not live quotes or confirmed inventory.</p>
      </div>
    </section>
    <PromoDeals />
    <section className="bg-white py-10">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Travel partners</p>
        <h2 className="mt-2 text-2xl font-bold text-[#242424]">Explore provider options</h2>
        <p className="mt-2 text-sm text-slate-600">Illustrative sample cards are available immediately. Prices are examples, not live quotes or confirmed availability.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TRAVEL_PROVIDERS.demoOffers.map((offer: {id:string;provider:string;title:string;priceFrom:number;currency:string;url:string;live:boolean})=><a key={offer.id} href={offer.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-[#FF5500] hover:shadow-lg hover:shadow-orange-100">
            <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-[#D94700]">{offer.provider}</span>
            <h3 className="mt-3 text-sm font-bold text-[#242424]">{offer.title}</h3>
            <p className="mt-3 text-lg font-extrabold text-[#FF5500]">From {offer.currency} {offer.priceFrom}</p>
            <p className="mt-1 text-[10px] text-slate-500">Indicative sample · check provider for current rates</p>
          </a>)}
        </div>
      </div>
    </section>
    <section className="bg-white py-12"><div className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Plan with confidence</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold text-[#172B4D]">Popular Travel Guides &amp; Route Insights</h2><p className="mt-2 text-sm text-slate-600">Practical advice for routes, seasons, car hire and airport pickups.</p></div><Link to="/guides" className="text-sm font-bold text-[#FF5500]">All travel guides →</Link></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['/guides#hunza-skardu-guide','Hunza & Skardu Valley Travel Planning & Best Season Guide'],['/guides#cheap-flights-pakistan-dubai-jeddah-london','How to Find Cheap Flights from Pakistan to Dubai, Jeddah & London'],['/guides#europe-uae-car-rental-guide','Europe & UAE Car Rental Guide: Comparing AutoEurope & QEEQ'],['/guides#airport-transfers-istanbul-dubai-saudi','Hassle-Free Airport Transfers in Istanbul, Dubai & Saudi Arabia']].map(([href,title])=><Link key={href} to={href} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm hover:border-[#FF5500] hover:shadow-lg"><h3 className="font-bold leading-6 text-[#172B4D]">{title}</h3><span className="mt-4 inline-block text-xs font-bold text-[#FF5500]">Read guide →</span></Link>)}</div>
    </div></section>    <section className="bg-[#FFF7F2] py-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Explore Pakistan and beyond</p>
        <h2 className="mt-2 text-2xl font-bold text-[#172B4D]">Popular travel searches</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['/flights/lahore-to-dubai','Flights from Lahore to Dubai','Compare route options and travel dates.'],
            ['/flights/islamabad-to-london','Flights from Islamabad to London','Explore direct and connecting journeys.'],
            ['/hotels/hunza-valley','Hotels in Hunza Valley','Find a stay for your mountain escape.'],
            ['/hotels/skardu','Hotels in Skardu','Explore accommodation around Skardu.'],
            ['/tours/northern-areas-pakistan','Northern Areas Pakistan tours','Plan a trip through Hunza and Skardu.'],
          ].map(([href,title,desc])=><Link key={href} to={href} className="group rounded-xl border border-orange-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#FF5500] hover:shadow-lg hover:shadow-orange-100"><h3 className="font-bold text-[#172B4D] group-hover:text-[#FF5500]">{title}</h3><p className="mt-2 text-sm text-slate-600">{desc}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#FF5500]">Explore <Icon name="arrowRight" className="size-4"/></span></Link>)}
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Airport transfers</p><h2 className="mt-2 text-2xl font-bold text-[#172B4D]">How it works</h2><div className="mt-5 grid gap-4 sm:grid-cols-3">{[['01','Choose your route','Enter pickup point, destination and travel time.'],['02','Select a vehicle','Compare passenger and luggage capacity.'],['03','Confirm with provider','Review final price and booking conditions.']].map(([n,t,d])=><div key={n} className="rounded-xl border border-orange-100 bg-[#FFF7F2] p-4"><span className="text-lg font-bold text-[#FF5500]">{n}</span><h3 className="mt-2 text-sm font-bold text-[#172B4D]">{t}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{d}</p></div>)}</div></div>
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Vehicle classes</p><h2 className="mt-2 text-2xl font-bold text-[#172B4D]">Choose your ride</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{[['Standard','3 passengers','2 bags'],['Full-size sedan','4 passengers','3 bags']].map(([name,people,bags])=><div key={name} className="rounded-xl border border-orange-100 p-4"><div className="flex items-center justify-between gap-2"><h3 className="font-bold text-[#172B4D]">{name}</h3><span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">Free cancellation*</span></div><p className="mt-3 text-sm text-slate-600">{people} · {bags}</p><p className="mt-3 text-[11px] text-slate-500">*Cancellation terms depend on the selected provider.</p></div>)}</div></div>
      </div>
      <div className="mt-10"><h2 className="text-xl font-bold text-[#172B4D]">Frequently asked questions</h2><div className="mt-4 divide-y divide-orange-100 rounded-xl border border-orange-100 bg-white px-5">{[['How does Trexifly work?','Trexifly helps compare travel options and redirects you to the booking partner to review availability and complete your reservation.'],['Are prices live and guaranteed?','Some displayed comparison examples may be indicative. Confirm current availability, taxes and final prices with the booking provider.'],['Can I cancel a transfer?','Cancellation rules vary by provider and vehicle. Review the policy before confirming your booking.']].map(([q,a])=><details key={q} className="py-4"><summary className="cursor-pointer text-sm font-semibold text-[#172B4D]">{q}</summary><p className="mt-2 text-sm leading-6 text-slate-600">{a}</p></details>)}</div></div>
    </section>
    {confidenceOpen && <div role="dialog" aria-modal="true" aria-labelledby="confidence-title" className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm" onClick={()=>setConfidenceOpen(false)}><div className="w-full max-w-xl rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl sm:p-8" onClick={e=>e.stopPropagation()}>
      <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-orange-50 text-[#FF5500]"><Icon name="shieldCheck" className="size-7" strokeWidth={2}/></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Partner transparency</p><h2 id="confidence-title" className="mt-1 text-xl font-extrabold text-[#172B4D]">Verified Partner &amp; Booking Confidence</h2></div></div><button type="button" aria-label="Close" onClick={()=>setConfidenceOpen(false)} className="rounded-full p-2 text-slate-500 hover:bg-orange-50 hover:text-[#FF5500]"><Icon name="close"/></button></div>
      <p className="mt-5 text-sm leading-6 text-slate-600">Trexifly helps you discover and compare travel options, then connects you directly to the relevant booking partner to review availability, final prices, payment and booking conditions. Trexifly does not issue tickets or take payment for partner bookings.</p>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{['Aviasales','Klook','KKday','AutoEurope','QEEQ','Tiqets','Kiwitaxi','GetTransfer','Intui.travel'].map(name=><span key={name} className="rounded-xl border border-orange-100 bg-[#FFF7F2] px-3 py-2 text-center text-xs font-semibold text-[#7C2D12]">{name}</span>)}</div>
      <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">No extra Trexifly booking fee. Partner prices, taxes, availability, cancellation rules and any supplier fees are confirmed on the partner website. Trexifly may earn a commission from qualifying referrals.</p>
      <button type="button" onClick={()=>setConfidenceOpen(false)} className="mt-6 w-full rounded-xl bg-[#FF5500] px-5 py-3 text-sm font-bold text-white hover:bg-[#E64A00]">Got it</button>
    </div></div>}
  </div>
}
