import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { SearchWidget } from '../components/SearchWidget'
import { Destinations } from '../components/Destinations'
import { Icon } from '../components/Icons'
// @ts-ignore â€” provider configuration is intentionally kept as plain JavaScript for easy editing.
import { TRAVEL_PROVIDERS } from '../config/travelProviders.js'

export function Home() {
  const navigate=useNavigate()
  const [confidenceOpen,setConfidenceOpen]=useState(false)
  const openWorldwide=()=>{window.dispatchEvent(new CustomEvent('trexifly:open-worldwide'));document.getElementById('destinations')?.scrollIntoView({behavior:'smooth',block:'start'})}
  return <>
    <section className="relative isolate overflow-hidden bg-[#FF5500] pb-10 pt-7 sm:pb-14 sm:pt-9">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[34%] overflow-hidden lg:block">
        <div className="absolute -right-12 top-0 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.30),rgba(255,255,255,0)_68%)]"/>
        <div className="absolute right-12 top-10 size-[360px] rounded-full border border-white/40 bg-[radial-gradient(circle_at_32%_25%,rgba(255,255,255,.85),rgba(255,255,255,.22)_28%,rgba(255,255,255,.06)_62%,rgba(116,36,9,.20))] shadow-[inset_-24px_-28px_55px_rgba(110,35,0,.20),0_35px_90px_rgba(105,35,0,.30)] backdrop-blur-xl"/>
        <div className="absolute right-[82px] top-[78px] size-[300px] rounded-full border border-white/65 shadow-[inset_0_0_35px_rgba(255,255,255,.38)]"/>
        <div className="absolute right-[115px] top-[115px] size-[235px] rotate-[-24deg] rounded-[46%] border-2 border-white/65 shadow-[0_0_24px_rgba(255,255,255,.35)]"/>
        <div className="absolute right-[180px] top-[170px] grid size-24 place-items-center rounded-[28px] border border-white/70 bg-white/25 text-white shadow-[0_18px_45px_rgba(105,35,0,.24)] backdrop-blur-xl"><svg viewBox="0 0 64 64" className="size-14 drop-shadow-lg" fill="none"><path d="M8 35 56 12 39 55 29 39 8 35Z" fill="white"/><path d="m29 39 27-27" stroke="#D94700" strokeWidth="2.5" strokeLinecap="round"/></svg></div>
        <div className="absolute right-8 top-24 rounded-2xl border border-white/60 bg-white/25 px-4 py-3 text-white shadow-xl backdrop-blur-xl"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/80">Discover</p><p className="text-sm font-extrabold">Everywhere</p></div>
        <div className="absolute bottom-10 right-10 rounded-2xl border border-white/60 bg-white/25 px-4 py-3 text-white shadow-xl backdrop-blur-xl"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/80">One search</p><p className="text-sm font-extrabold">Global journeys</p></div>
      </div>
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:pr-[24%]"><SearchWidget/></div>
    </section>
    <section className="border-y border-orange-100 bg-white py-5"><div className="mx-auto grid max-w-[1280px] gap-4 px-4 sm:grid-cols-3 sm:px-6">
      <button type="button" onClick={openWorldwide} className="group flex w-full items-center gap-3 rounded-2xl border border-orange-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#FF5500] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5500]"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#FF5500] text-white shadow-md shadow-orange-200"><Icon name="globe" className="size-6"/></span><span><span className="block text-sm font-bold text-[#172B4D]">Worldwide discovery</span><span className="mt-1 block text-xs leading-5 text-slate-600">Explore destinations and airports across the globe.</span></span><Icon name="arrowRight" className="ml-auto size-4 text-[#FF5500]"/></button>
      <button type="button" onClick={()=>navigate('/results?type=flights')} className="group flex w-full items-center gap-3 rounded-2xl border border-orange-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#FF5500] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5500]"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#FF5500] text-white shadow-md shadow-orange-200"><Icon name="search" className="size-6"/></span><span><span className="block text-sm font-bold text-[#172B4D]">One clear comparison</span><span className="mt-1 block text-xs leading-5 text-slate-600">Review travel options and provider details in one place.</span></span><Icon name="arrowRight" className="ml-auto size-4 text-[#FF5500]"/></button>
      <button type="button" onClick={()=>setConfidenceOpen(true)} className="group flex w-full items-center gap-3 rounded-2xl border border-orange-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#FF5500] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5500]"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#FF5500] text-white shadow-md shadow-orange-200"><Icon name="shieldCheck" className="size-6" strokeWidth={2}/></span><span><span className="block text-sm font-bold text-[#172B4D]">Travel with confidence</span><span className="mt-1 block text-xs leading-5 text-slate-600">Check final prices and booking terms with providers.</span></span><Icon name="arrowRight" className="ml-auto size-4 text-[#FF5500]"/></button>
    </div></section>
    <Destinations/>
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
            <p className="mt-1 text-[10px] text-slate-500">Indicative sample Â· check provider for current rates</p>
          </a>)}
        </div>
      </div>
    </section>
    <section className="bg-white py-12"><div className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Plan with confidence</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold text-[#172B4D]">Popular Travel Guides &amp; Route Insights</h2><p className="mt-2 text-sm text-slate-600">Practical advice for routes, seasons, car hire and airport pickups.</p></div><Link to="/guides" className="text-sm font-bold text-[#FF5500]">All travel guides â†’</Link></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['/guides#hunza-skardu-guide','Hunza & Skardu Valley Travel Planning & Best Season Guide'],['/guides#cheap-flights-pakistan-dubai-jeddah-london','How to Find Cheap Flights from Pakistan to Dubai, Jeddah & London'],['/guides#europe-uae-car-rental-guide','Europe & UAE Car Rental Guide: Comparing AutoEurope & QEEQ'],['/guides#airport-transfers-istanbul-dubai-saudi','Hassle-Free Airport Transfers in Istanbul, Dubai & Saudi Arabia']].map(([href,title])=><Link key={href} to={href} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm hover:border-[#FF5500] hover:shadow-lg"><h3 className="font-bold leading-6 text-[#172B4D]">{title}</h3><span className="mt-4 inline-block text-xs font-bold text-[#FF5500]">Read guide â†’</span></Link>)}</div>
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
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Vehicle classes</p><h2 className="mt-2 text-2xl font-bold text-[#172B4D]">Choose your ride</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{[['Standard','3 passengers','2 bags'],['Full-size sedan','4 passengers','3 bags']].map(([name,people,bags])=><div key={name} className="rounded-xl border border-orange-100 p-4"><div className="flex items-center justify-between gap-2"><h3 className="font-bold text-[#172B4D]">{name}</h3><span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">Free cancellation*</span></div><p className="mt-3 text-sm text-slate-600">{people} Â· {bags}</p><p className="mt-3 text-[11px] text-slate-500">*Cancellation terms depend on the selected provider.</p></div>)}</div></div>
      </div>
      <div className="mt-10"><h2 className="text-xl font-bold text-[#172B4D]">Frequently asked questions</h2><div className="mt-4 divide-y divide-orange-100 rounded-xl border border-orange-100 bg-white px-5">{[['How does Trexifly work?','Trexifly helps compare travel options and redirects you to the booking partner to review availability and complete your reservation.'],['Are prices live and guaranteed?','Some displayed comparison examples may be indicative. Confirm current availability, taxes and final prices with the booking provider.'],['Can I cancel a transfer?','Cancellation rules vary by provider and vehicle. Review the policy before confirming your booking.']].map(([q,a])=><details key={q} className="py-4"><summary className="cursor-pointer text-sm font-semibold text-[#172B4D]">{q}</summary><p className="mt-2 text-sm leading-6 text-slate-600">{a}</p></details>)}</div></div>
    </section>
    {confidenceOpen && <div role="dialog" aria-modal="true" aria-labelledby="confidence-title" className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm" onClick={()=>setConfidenceOpen(false)}><div className="w-full max-w-xl rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl sm:p-8" onClick={e=>e.stopPropagation()}>
      <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-orange-50 text-[#FF5500]"><Icon name="shieldCheck" className="size-7" strokeWidth={2}/></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Partner transparency</p><h2 id="confidence-title" className="mt-1 text-xl font-extrabold text-[#172B4D]">Verified Partner &amp; Booking Confidence</h2></div></div><button type="button" aria-label="Close" onClick={()=>setConfidenceOpen(false)} className="rounded-full p-2 text-slate-500 hover:bg-orange-50 hover:text-[#FF5500]"><Icon name="close"/></button></div>
      <p className="mt-5 text-sm leading-6 text-slate-600">Trexifly helps you discover and compare travel options, then connects you directly to the relevant booking partner to review availability, final prices, payment and booking conditions. Trexifly does not issue tickets or take payment for partner bookings.</p>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{['Aviasales','Klook','KKday','AutoEurope','QEEQ','Tiqets','Kiwitaxi','GetTransfer'].map(name=><span key={name} className="rounded-xl border border-orange-100 bg-[#FFF7F2] px-3 py-2 text-center text-xs font-semibold text-[#7C2D12]">{name}</span>)}</div>
      <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">No extra Trexifly booking fee. Partner prices, taxes, availability, cancellation rules and any supplier fees are confirmed on the partner website. Trexifly may earn a commission from qualifying referrals.</p>
      <button type="button" onClick={()=>setConfidenceOpen(false)} className="mt-6 w-full rounded-xl bg-[#FF5500] px-5 py-3 text-sm font-bold text-white hover:bg-[#E64A00]">Got it</button>
    </div></div>}
  </>
}
