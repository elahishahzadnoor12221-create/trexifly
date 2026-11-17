import { Link } from 'react-router'
import { SearchWidget } from '../components/SearchWidget'
import { Destinations } from '../components/Destinations'
import { Icon } from '../components/Icons'
// @ts-ignore — provider configuration is intentionally kept as plain JavaScript for easy editing.
import { TRAVEL_PROVIDERS } from '../config/travelProviders.js'

export function Home() {
  return <>
    <section className="relative isolate overflow-hidden bg-[#FF5500] pb-10 pt-7 sm:pb-14 sm:pt-9">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[30%] overflow-hidden bg-gradient-to-br from-[#FF9A3D] via-[#F36B16] to-[#C83D17] lg:block">
        <div className="absolute -right-20 top-8 size-[440px] rounded-full border border-white/25"/>
        <div className="absolute -right-4 top-20 size-[320px] rounded-full border border-white/25"/>
        <div className="absolute right-10 top-24 grid size-64 place-items-center rounded-full border border-white/40 bg-white/10 shadow-2xl backdrop-blur-sm">
          <svg viewBox="0 0 240 240" className="size-56" fill="none">
            <circle cx="120" cy="120" r="93" fill="#EAF3F7" stroke="#FFFFFF" strokeWidth="4"/>
            <path d="M44 93 66 64l30-13 20 16-9 23-26 10-7 27-24-4-6-30Zm84-38 31 10 19 22-14 17-23-7-16-22 3-20Zm-4 72 27-12 34 12 20 28-18 26-35 3-20-24-8-33Zm-69 15 26-4 18 20-8 32-26-7-13-20 3-21Z" fill="#34495B" opacity=".9"/>
            <path d="m48 171 22 8 15 22-15 13-23-17 1-26Zm107-123 14-15 16 9-5 17-19 4-6-15Z" fill="#34495B"/>
            <path d="m80 146 105-67-35 75-17-5-19 23-6-23-28-3Z" fill="#F36B16" stroke="#B92B16" strokeWidth="3"/>
            <path d="m135 148 23-7 35 8-39 8-19-9Z" fill="#FFF4E9"/>
          </svg>
        </div>
        <div className="absolute bottom-10 right-12 text-right text-white"><p className="text-2xl font-black tracking-tight">Explore more.</p><p className="text-sm font-medium text-white/85">The world is within reach.</p></div>
      </div>
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:pr-[24%]"><SearchWidget/></div>
    </section>
    <section className="border-y border-orange-100 bg-white py-5">
      <div className="mx-auto grid max-w-[1280px] gap-4 px-4 sm:grid-cols-3 sm:px-6">
        {[
          ['Worldwide discovery','Explore destinations and airports across the globe.','globe'],
          ['One clear comparison','Review travel options and provider details in one place.','search'],
          ['Travel with confidence','Check final prices and booking terms with providers.','shieldCheck'],
        ].map(([title,desc,icon])=><div key={title} className="flex gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#FFB800] to-[#D99A00] text-white shadow-md shadow-orange-200"><Icon name={icon as any} className="size-5"/></span><div><h2 className="text-sm font-bold text-[#172B4D]">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-600">{desc}</p></div></div>)}
      </div>
    </section>
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
            <p className="mt-1 text-[10px] text-slate-500">Indicative sample · check provider for current rates</p>
          </a>)}
        </div>
      </div>
    </section>
    <section className="bg-[#FFF7F2] py-12">
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
  </>
}
