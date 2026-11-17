import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Icon, type IconName } from './Icons'
import { isoIn, type SearchQuery } from '../lib/data'

type Tab = 'hotels' | 'flights' | 'cars' | 'tours' | 'transfers'
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'hotels', label: 'Stays', icon: 'bed' },
  { id: 'flights', label: 'Flights', icon: 'plane' },
  { id: 'cars', label: 'Car Rental', icon: 'car' },
  { id: 'tours', label: 'Activities', icon: 'compass' },
  { id: 'transfers', label: 'Airport Transfers', icon: 'car' },
]
const AIRPORTS = ["Lahore (LHE)","Islamabad (ISB)","Karachi (KHI)","Peshawar (PEW)","Quetta (UET)","Multan (MUX)","Faisalabad (LYP)","Skardu (KDU)","Gilgit (GIL)","Dubai (DXB)","Abu Dhabi (AUH)","Sharjah (SHJ)","Doha (DOH)","Riyadh (RUH)","Jeddah (JED)","Muscat (MCT)","Manama (BAH)","Kuwait City (KWI)","London Heathrow (LHR)","London Gatwick (LGW)","Manchester (MAN)","Paris (CDG)","Amsterdam (AMS)","Frankfurt (FRA)","Munich (MUC)","Zurich (ZRH)","Geneva (GVA)","Rome (FCO)","Milan (MXP)","Madrid (MAD)","Barcelona (BCN)","Istanbul (IST)","Antalya (AYT)","Athens (ATH)","New York (JFK)","New York Newark (EWR)","Los Angeles (LAX)","San Francisco (SFO)","Chicago (ORD)","Toronto (YYZ)","Vancouver (YVR)","Montreal (YUL)","Delhi (DEL)","Mumbai (BOM)","Bengaluru (BLR)","Bangkok (BKK)","Phuket (HKT)","Singapore (SIN)","Kuala Lumpur (KUL)","Jakarta (CGK)","Bali (DPS)","Hong Kong (HKG)","Tokyo Haneda (HND)","Tokyo Narita (NRT)","Seoul (ICN)","Sydney (SYD)","Melbourne (MEL)","Auckland (AKL)","Cairo (CAI)","Cape Town (CPT)","Johannesburg (JNB)","Nairobi (NBO)","Casablanca (CMN)"]
const WORLD_DESTINATIONS = ["Dubai, United Arab Emirates","Abu Dhabi, United Arab Emirates","Doha, Qatar","Riyadh, Saudi Arabia","Jeddah, Saudi Arabia","Muscat, Oman","Istanbul, Türkiye","Antalya, Türkiye","London, United Kingdom","Manchester, United Kingdom","Paris, France","Nice, France","Amsterdam, Netherlands","Rome, Italy","Milan, Italy","Barcelona, Spain","Madrid, Spain","Zurich, Switzerland","Geneva, Switzerland","Berlin, Germany","Munich, Germany","Vienna, Austria","Prague, Czechia","Athens, Greece","New York, United States","Los Angeles, United States","San Francisco, United States","Miami, United States","Orlando, United States","Toronto, Canada","Vancouver, Canada","Montreal, Canada","Mexico City, Mexico","Cancun, Mexico","São Paulo, Brazil","Rio de Janeiro, Brazil","Buenos Aires, Argentina","Lahore, Pakistan","Islamabad, Pakistan","Karachi, Pakistan","Hunza Valley, Pakistan","Skardu, Pakistan","Bangkok, Thailand","Phuket, Thailand","Singapore","Kuala Lumpur, Malaysia","Bali, Indonesia","Jakarta, Indonesia","Hong Kong","Tokyo, Japan","Osaka, Japan","Seoul, South Korea","Shanghai, China","Beijing, China","Delhi, India","Mumbai, India","Goa, India","Colombo, Sri Lanka","Kathmandu, Nepal","Maldives","Sydney, Australia","Melbourne, Australia","Auckland, New Zealand","Cairo, Egypt","Cape Town, South Africa","Johannesburg, South Africa","Nairobi, Kenya","Marrakech, Morocco","Tbilisi, Georgia","Baku, Azerbaijan"]
const LOCATIONS = [...AIRPORTS.map(a => a.replace(/ \([A-Z]{3}\)$/, ' Airport')), ...WORLD_DESTINATIONS]
const field = 'min-w-0 w-full border-0 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-500'
const label = 'mb-1 block text-[11px] font-semibold text-slate-500'
const cell = 'min-w-0 flex-1 border-b border-slate-200 px-2 py-1 sm:border-b-0 sm:border-r last:border-0'

function SelectField({ title, value, onChange, options }: { title: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className={cell}><span className={label}>{title}</span><select className={field} value={value} onChange={e => onChange(e.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select></label>
}
function TextField({ title, value, onChange, placeholder, type = 'text' }: { title: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <label className={cell}><span className={label}>{title}</span><input className={field} type={type} value={value} placeholder={placeholder} autoComplete="off" onChange={e => onChange(e.target.value)} /></label>
}

function LocationField({ title, value, onChange, placeholder, options = [] }: { title: string; value: string; onChange: (value: string) => void; placeholder: string; options?: string[] }) {
  const [open, setOpen] = useState(false)
  const [remote, setRemote] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const local = useMemo(() => options.filter(item => item.toLowerCase().includes(value.trim().toLowerCase())).slice(0, 8), [options, value])
  useEffect(() => {
    const term = value.trim()
    if (term.length < 2) { setRemote([]); setLoading(false); return }
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setLoading(true)
      fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(term) + '&count=20&language=en&format=json', { signal: controller.signal })
        .then(response => response.ok ? response.json() as Promise<{ results?: { name: string; admin1?: string; country?: string; feature_code?: string }[] }> : Promise.reject(new Error('Search unavailable')))
        .then(data => setRemote((data.results ?? []).map(place => [place.name, place.admin1, place.country].filter(Boolean).join(', '))))
        .catch(() => { if (!controller.signal.aborted) setRemote([]) })
        .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    }, 300)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [value])
  const suggestions = [...new Set([...local, ...remote])].slice(0, 10)
  return <div className={cell + ' relative'}><label className="block"><span className={label}>{title}</span><input className={field} role="combobox" aria-expanded={open} aria-autocomplete="list" value={value} placeholder={placeholder} autoComplete="off" onFocus={() => setOpen(true)} onChange={e => { onChange(e.target.value); setOpen(true) }} onKeyDown={e => { if (e.key === 'Escape') setOpen(false); if (e.key === 'Enter' && suggestions[0] && open) { e.preventDefault(); onChange(suggestions[0]); setOpen(false) } }} /></label>
    {open && (suggestions.length > 0 || loading || value.trim().length >= 2) && <div role="listbox" className="absolute left-0 right-0 top-full z-[70] mt-1 max-h-64 overflow-y-auto rounded-xl border border-orange-100 bg-white p-1.5 shadow-[0_14px_35px_rgba(30,20,10,.18)]">
      {suggestions.map((item, index) => <button type="button" role="option" aria-selected={item === value} key={item} onMouseDown={e => e.preventDefault()} onClick={() => { onChange(item); setOpen(false) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-800 hover:bg-orange-50"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-orange-100 text-[#FFB800]"><Icon name="mapPin" className="size-4"/></span><span className="min-w-0 flex-1 truncate">{item}</span>{index === 0 && <span className="text-[10px] font-semibold text-[#FFB800]">Top match</span>}</button>)}
      {loading && <p className="px-3 py-2 text-xs text-slate-500">Searching worldwide cities and destinations…</p>}{!loading && suggestions.length === 0 && value.trim().length >= 2 && <p className="px-3 py-3 text-xs text-slate-500">No exact match yet. You can still search this destination by name.</p>}
    </div>}
    <p className="sr-only">Search worldwide cities and airports. Powered by Open-Meteo geocoding.</p>
  </div>
}
function Check({ children }: { children: ReactNode }) { return <label className="inline-flex items-center gap-2 text-xs text-slate-700">{children}</label> }

export function SearchWidget({ initial, compact = false }: { initial?: Partial<SearchQuery>; compact?: boolean }) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const fromUrl = params.get('tab')
  const validTab = TABS.some(t => t.id === fromUrl) ? fromUrl as Tab : undefined
  const [tab, setTab] = useState<Tab>(initial?.type === 'hotels' ? 'hotels' : initial?.type === 'cars' ? (params.get('service') === 'airport-transfer' ? 'transfers' : 'cars') : initial?.type === 'tours' ? 'tours' : validTab ?? 'hotels')
  useEffect(() => { if (validTab) setTab(validTab) }, [validTab])
  const [destination, setDestination] = useState(initial?.to ?? 'Dubai')
  const [from, setFrom] = useState(initial?.from ?? 'Lahore (LHE)')
  const [to, setTo] = useState(initial?.to ?? 'Dubai (DXB)')
  useEffect(() => {
    const onDestination = (event: Event) => {
      const detail = (event as CustomEvent<{ destination?: string }>).detail
      if (!detail?.destination) return
      setDestination(detail.destination)
      setTo(detail.destination)
    }
    window.addEventListener('trexifly:select-destination', onDestination)
    return () => window.removeEventListener('trexifly:select-destination', onDestination)
  }, [])
  const [depart, setDepart] = useState(initial?.out ?? isoIn(21))
  const [back, setBack] = useState(initial?.back ?? isoIn(28))
  const [trip, setTrip] = useState('Round-trip')
  const [pax, setPax] = useState(initial?.pax ?? '1 adult, Economy')
  const [rooms, setRooms] = useState('2 adults · 0 children · 1 room')
  const [pickup, setPickup] = useState('Dubai International Airport')
  const [dropoff, setDropoff] = useState('Dubai International Airport')
  const [pickupTime, setPickupTime] = useState('10:00')
  const [dropTime, setDropTime] = useState('10:00')
  const [transferType, setTransferType] = useState('One-way')
  const [passengers, setPassengers] = useState('2 passengers')
  const [activityDate, setActivityDate] = useState('')
  const [carDifferent, setCarDifferent] = useState(false)
  const [workTrip, setWorkTrip] = useState(false)
  const [entireHome, setEntireHome] = useState(false)
  const [driverAge, setDriverAge] = useState(true)

  const copy = useMemo(() => ({
    hotels: ['Find your next stay', 'Search deals on hotels, homes, and much more...'],
    flights: ['Search hundreds of flight sites at once.', 'Compare routes, schedules and booking options in one place.'],
    cars: ['Car rentals for any kind of trip', 'Great cars at great prices from the biggest rental companies'],
    tours: ['Attractions, activities, and experiences', 'Discover new activities and experiences to match your interests and travel style'],
    transfers: ['Book your airport transfer', 'Easy transportation between the airport and your accommodations'],
  } as Record<Tab, string[]>)[tab], [tab])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const type = tab === 'hotels' ? 'hotels' : tab === 'flights' ? 'flights' : tab === 'tours' ? 'tours' : 'cars'
    const query = new URLSearchParams({ type })
    if (tab === 'flights') {
      query.set('from', from); query.set('to', to); query.set('out', depart); query.set('back', trip === 'One-way' ? depart : back); query.set('pax', pax)
    } else if (tab === 'hotels') {
      query.set('to', destination); query.set('out', depart); query.set('back', back); query.set('pax', rooms)
    } else if (tab === 'cars') {
      query.set('from', pickup); query.set('to', carDifferent ? dropoff : pickup); query.set('out', depart); query.set('back', back); query.set('vehicle', 'Standard')
    } else if (tab === 'tours') {
      query.set('to', destination); query.set('out', activityDate || depart); query.set('back', activityDate || back); query.set('duration', '5-7 days'); query.set('pkg', 'Private')
    } else {
      query.set('from', pickup); query.set('to', dropoff); query.set('out', depart); query.set('back', transferType === 'Return' ? back : depart); query.set('pax', passengers); query.set('service', 'airport-transfer'); query.set('pickupTime', pickupTime)
    }
    navigate('/results?' + query.toString())
  }

  const tabNav = <div role="tablist" aria-label="Travel search type" className="flex flex-wrap gap-2">
    {TABS.map(item => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => { setTab(item.id); if (!compact) { const next = new URLSearchParams(params); next.set('tab', item.id); setParams(next, { replace: true }) } }} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${compact ? (tab === item.id ? 'border-[#FF5500] bg-orange-50 text-[#B93600] shadow-sm' : 'border-orange-100 bg-white text-slate-700 hover:border-[#FF5500] hover:bg-orange-50') : (tab === item.id ? 'border-white bg-white/15 text-white shadow-[0_6px_18px_rgba(243,107,22,.25)]' : 'border-orange-200 bg-white text-slate-700 hover:border-[#FF5500] hover:bg-orange-50')}`}><Icon name={item.icon} className={`size-4 ${compact ? (tab === item.id ? 'text-[#B93600]' : 'text-[#D97706]') : (tab === item.id ? 'text-white' : 'text-[#B93600]')}`} />{item.label}</button>)}
  </div>

  return <section id="search-widget" className={compact ? 'w-full' : 'w-full'}>
    {!compact && <div className="mb-5 text-slate-900"><h1 className="text-3xl font-bold tracking-tight text-[#171A20] sm:text-4xl">{tab === 'flights' ? <>Search <span className="text-[#B93600]">hundreds of flight sites</span> at once.</> : tab === 'hotels' ? <>Find your <span className="text-[#B93600]">next stay</span></> : tab === 'cars' ? <>Car rentals for <span className="text-[#B93600]">any kind of trip</span></> : tab === 'tours' ? <>Attractions, activities, and <span className="text-[#B93600]">experiences</span></> : <>Book your <span className="text-[#B93600]">airport transfer</span></>}</h1><p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{copy[1]}</p></div>}

    {compact && <div className="mb-3">{tabNav}</div>}
    <form onSubmit={submit} className="rounded-2xl border-4 border-[#FFB800] bg-white p-2 shadow-[0_10px_35px_rgba(0,0,0,.16)]">
      {tab === 'hotels' && <div className="flex flex-col sm:flex-row sm:items-stretch">
        <LocationField title="Destination" value={destination} onChange={setDestination} placeholder="Search worldwide cities and destinations" options={WORLD_DESTINATIONS} />
        <TextField title="Check-in" value={depart} onChange={setDepart} placeholder="Check-in" type="date" />
        <TextField title="Check-out" value={back} onChange={setBack} placeholder="Check-out" type="date" />
        <SelectField title="Guests and rooms" value={rooms} onChange={setRooms} options={['2 adults · 0 children · 1 room','1 adult · 0 children · 1 room','2 adults · 1 child · 1 room','2 adults · 0 children · 2 rooms']} />
        <button className="m-1 rounded-xl bg-[#FF5500] px-6 py-3 text-sm font-bold text-white shadow-sm shadow-orange-200 hover:bg-[#E64A00]">Search</button>
      </div>}
      {tab === 'hotels' && <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 px-3 pt-3"><Check><input type="checkbox" checked={entireHome} onChange={e => setEntireHome(e.target.checked)} className="size-4 accent-[#FF5500]"/>I'm looking for an entire home or apartment</Check><Check><input type="checkbox" checked={workTrip} onChange={e => setWorkTrip(e.target.checked)} className="size-4 accent-[#FF5500]"/>I'm traveling for work</Check></div>}
      {tab === 'flights' && <div className="flex flex-col sm:flex-row sm:items-stretch">
        <SelectField title="Trip type" value={trip} onChange={setTrip} options={['Round-trip','One-way']} />
        <LocationField title="From" value={from} onChange={setFrom} placeholder="City or airport worldwide" options={AIRPORTS} />
        <LocationField title="To" value={to} onChange={setTo} placeholder="Search worldwide city or airport" options={AIRPORTS.filter(a => a !== from)} />
        <TextField title="Departure" value={depart} onChange={setDepart} placeholder="Departure" type="date" />
        {trip === 'Round-trip' && <TextField title="Return" value={back} onChange={setBack} placeholder="Return" type="date" />}
        <SelectField title="Travellers · class" value={pax} onChange={setPax} options={['1 adult, Economy','2 adults, Economy','1 adult, Business','2 adults, Business','3 adults, Economy']} />
        <button className="m-1 rounded-xl bg-[#FF5500] px-6 py-3 text-sm font-bold text-white shadow-sm shadow-orange-200 hover:bg-[#E64A00]">Search</button>
      </div>}
      {tab === 'cars' && <><div className="flex flex-col sm:flex-row sm:items-stretch">
        <LocationField title="Pick-up location" value={pickup} onChange={setPickup} placeholder="Airport, city, or station worldwide" options={LOCATIONS} />
        <TextField title="Pick-up date" value={depart} onChange={setDepart} placeholder="Pick-up date" type="date" />
        <TextField title="Time" value={pickupTime} onChange={setPickupTime} placeholder="10:00 AM" type="time" />
        <TextField title="Drop-off date" value={back} onChange={setBack} placeholder="Drop-off date" type="date" />
        <TextField title="Time" value={dropTime} onChange={setDropTime} placeholder="10:00 AM" type="time" />
        <button className="m-1 rounded-xl bg-[#FF5500] px-6 py-3 text-sm font-bold text-white shadow-sm shadow-orange-200 hover:bg-[#E64A00]">Search</button>
      </div><div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 px-3 pt-3"><label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={carDifferent} onChange={e => setCarDifferent(e.target.checked)} className="size-4 accent-[#FF5500]" />Drop car off at different location</label><label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={driverAge} onChange={e => setDriverAge(e.target.checked)} className="size-4 accent-[#FF5500]" />Driver aged 30 – 65?</label></div>{carDifferent && <div className="mt-2 px-2"><LocationField title="Drop-off location" value={dropoff} onChange={setDropoff} placeholder="Choose worldwide drop-off location" options={LOCATIONS} /></div>}</>}
      {tab === 'tours' && <div className="flex flex-col sm:flex-row sm:items-stretch">
        <LocationField title="Destination" value={destination} onChange={setDestination} placeholder="Search any city worldwide" options={WORLD_DESTINATIONS} />
        <TextField title="Dates" value={activityDate} onChange={setActivityDate} placeholder="Select dates" type="date" />
        <button className="m-1 rounded-xl bg-[#FF5500] px-6 py-3 text-sm font-bold text-white shadow-sm shadow-orange-200 hover:bg-[#E64A00]">Search</button>
      </div>}
      {tab === 'transfers' && <><div className="flex gap-5 px-3 pb-3 pt-1"><label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="transfer-type" checked={transferType === 'One-way'} onChange={() => setTransferType('One-way')} className="accent-[#FF5500]" />One-way</label><label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="transfer-type" checked={transferType === 'Return'} onChange={() => setTransferType('Return')} className="accent-[#FF5500]" />Return</label></div><div className="flex flex-col sm:flex-row sm:items-stretch">
        <LocationField title="Pick-up location" value={pickup} onChange={setPickup} placeholder="Airport, city or address worldwide" options={LOCATIONS} />
        <LocationField title="Destination" value={dropoff} onChange={setDropoff} placeholder="Airport, city or address worldwide" options={LOCATIONS} />
        <TextField title="Pick-up date" value={depart} onChange={setDepart} placeholder="Date" type="date" />
        <TextField title="Pick-up time" value={pickupTime} onChange={setPickupTime} placeholder="Time" type="time" />
        <SelectField title="Passengers" value={passengers} onChange={setPassengers} options={['1 passenger','2 passengers','3 passengers','4 passengers','5 passengers','6 passengers']} />
        <button className="m-1 rounded-xl bg-[#FF5500] px-6 py-3 text-sm font-bold text-white shadow-sm shadow-orange-200 hover:bg-[#E64A00]">Search</button>
      </div></>}
    </form>
    {!compact && tab === 'flights' && <div className="mt-6 grid grid-cols-3 gap-3"><img className="h-24 w-full rounded-xl object-cover sm:h-32" src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=85" alt="Dubai skyline"/><img className="h-24 w-full rounded-xl object-cover sm:h-32" src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=85" alt="London city"/><img className="h-24 w-full rounded-xl object-cover sm:h-32" src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=700&q=85" alt="Istanbul skyline"/></div>}
    {!compact && tab === 'tours' && <div className="mt-6"><h2 className="mb-3 text-sm font-bold text-[#171A20]">Top destinations</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[['Dubai','photo-1512453979798-5ea266f8880c'],['London','photo-1513635269975-59663e0ac1ad'],['Istanbul','photo-1524231757912-21f4fe3a7200'],['Hunza Valley','photo-1544735716-392fe2489ffa'],['Skardu','photo-1589553416260-f586c8f1514f']].map(([name,img])=><div key={name} className="relative h-28 overflow-hidden rounded-xl sm:h-32"><img src={`https://images.unsplash.com/${img}?auto=format&fit=crop&w=700&q=85`} alt={name} className="size-full object-cover"/><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-sm font-bold text-white">{name}</span></div>)}</div></div>}
    {!compact && tab === 'transfers' && <div className="mt-6 grid gap-3 sm:grid-cols-3">{[['Flight tracking','We monitor your flight arrival details.'],['One clear price','Know the fare before you travel.'],['Tried and true service','Choose a vehicle class for your journey.']].map(([title,desc])=><div key={title} className="rounded-xl border border-white/20 bg-white/10 p-4 text-white"><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-white/75">{desc}</p></div>)}</div>}
  </section>
}
