import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Icon, type IconName } from './Icons'
import {  isoIn, type SearchQuery , PLACES } from '../lib/data'
import { imgFallback } from '../lib/imageFallback'
import { FlightDatePicker } from './FlightDatePicker'

type Tab = 'hotels' | 'flights' | 'cars' | 'tours' | 'transfers'
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'hotels', label: 'Stays', icon: 'bed' },
  { id: 'flights', label: 'Flights', icon: 'plane' },
  { id: 'cars', label: 'Car Rental', icon: 'car' },
  { id: 'tours', label: 'Activities', icon: 'compass' },
  { id: 'transfers', label: 'Airport Transfers', icon: 'car' },
]
const AIRPORTS = PLACES.filter((p) => p.code).map((p) => `${p.city} (${p.code}) - ${p.airport ? p.airport + ', ' : ''}${p.country}`)
const FLIGHT_LOCATIONS = [...AIRPORTS, 'Hunza, Pakistan', 'Swat, Pakistan']
function isValidFlightAirport(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return false
  return PLACES.some(place => Boolean(place.code) && (
    normalized === place.code!.toLowerCase() ||
    normalized.includes(`(${place.code!.toLowerCase()})`) ||
    normalized === place.city.toLowerCase()
  ))
}
const WORLD_DESTINATIONS = ["Dubai, United Arab Emirates","Abu Dhabi, United Arab Emirates","Doha, Qatar","Riyadh, Saudi Arabia","Jeddah, Saudi Arabia","Makkah, Saudi Arabia","Madinah, Saudi Arabia","Muscat, Oman","Istanbul, Türkiye","Antalya, Türkiye","London, United Kingdom","Manchester, United Kingdom","Paris, France","Nice, France","Amsterdam, Netherlands","Rome, Italy","Milan, Italy","Barcelona, Spain","Madrid, Spain","Zurich, Switzerland","Geneva, Switzerland","Berlin, Germany","Munich, Germany","Vienna, Austria","Prague, Czechia","Athens, Greece","New York, United States","Los Angeles, United States","San Francisco, United States","Miami, United States","Orlando, United States","Toronto, Canada","Vancouver, Canada","Montreal, Canada","Mexico City, Mexico","Cancun, Mexico","São Paulo, Brazil","Rio de Janeiro, Brazil","Buenos Aires, Argentina","Lahore, Pakistan","Islamabad, Pakistan","Karachi, Pakistan","Hunza Valley, Pakistan","Hunza, Pakistan","Swat, Pakistan","Kalam, Pakistan","Skardu, Pakistan","Bangkok, Thailand","Phuket, Thailand","Singapore","Kuala Lumpur, Malaysia","Bali, Indonesia","Jakarta, Indonesia","Hong Kong","Tokyo, Japan","Osaka, Japan","Seoul, South Korea","Shanghai, China","Beijing, China","Delhi, India","Mumbai, India","Goa, India","Colombo, Sri Lanka","Kathmandu, Nepal","Maldives","Sydney, Australia","Melbourne, Australia","Auckland, New Zealand","Cairo, Egypt","Cape Town, South Africa","Johannesburg, South Africa","Nairobi, Kenya","Marrakech, Morocco","Tbilisi, Georgia","Baku, Azerbaijan"]
const GLOBAL_STAYS_DESTINATIONS = [
  'Dublin, Ireland','Cork, Ireland','Galway, Ireland','Belfast, Northern Ireland',
  'Edinburgh, Scotland','Glasgow, Scotland','Lisbon, Portugal','Porto, Portugal',
  'Copenhagen, Denmark','Stockholm, Sweden','Oslo, Norway','Helsinki, Finland',
  'Brussels, Belgium','Budapest, Hungary','Warsaw, Poland','Reykjavik, Iceland',
  'Perth, Australia','Brisbane, Australia','Adelaide, Australia','Canberra, Australia',
  'Christchurch, New Zealand','Wellington, New Zealand','Queenstown, New Zealand',
  'Nadi, Fiji','Papeete, French Polynesia','Apia, Samoa','Port Vila, Vanuatu','Suva, Fiji',
  'Honolulu, United States','Boston, United States','Chicago, United States','Seattle, United States',
  'Washington, United States','Calgary, Canada','Ottawa, Canada','Quebec City, Canada',
  'Peshawar, Pakistan','Quetta, Pakistan','Multan, Pakistan','Faisalabad, Pakistan','Gilgit, Pakistan','Chitral, Pakistan'
]
const WORLD_LANDMARKS = [
  'Burj Khalifa, Downtown Dubai, United Arab Emirates','Atlantis The Palm, Palm Jumeirah, Dubai, United Arab Emirates','Burj Al Arab, Jumeirah, Dubai, United Arab Emirates','Dubai Mall, Downtown Dubai, United Arab Emirates','Downtown Dubai, United Arab Emirates','Dubai Marina, United Arab Emirates','Palm Jumeirah, Dubai, United Arab Emirates','Deira, Dubai, United Arab Emirates',
  'Makkah Clock Royal Tower, Makkah, Saudi Arabia','Makkah Clock Tower, Makkah, Saudi Arabia','Pullman Zamzam Makkah, Makkah, Saudi Arabia','Haram Hotels, Makkah, Saudi Arabia','Anwar Al Madinah Movenpick, Madinah, Saudi Arabia','Madinah Haram Area, Madinah, Saudi Arabia','Jeddah Corniche, Jeddah, Saudi Arabia','King Abdulaziz International Airport, Jeddah, Saudi Arabia','Riyadh, Saudi Arabia',
  'Pearl Continental Lahore, Lahore, Pakistan','Serena Hotel Islamabad, Islamabad, Pakistan','Marriott Karachi, Karachi, Pakistan','Gulberg, Lahore, Pakistan','F-7, Islamabad, Pakistan','Clifton, Karachi, Pakistan',
  'Taksim Square, Istanbul, Turkey','Central London, United Kingdom','Heathrow Airport, London, United Kingdom','Hunza Valley, Pakistan','Skardu, Pakistan','Swat Valley, Pakistan','Kalam, Swat, Pakistan','Cappadocia, Turkey'
]
const LOCATIONS = [...new Set([...AIRPORTS.map(a => a.replace(/ \([A-Z]{3}\)$/, ' Airport')), ...WORLD_DESTINATIONS, ...GLOBAL_STAYS_DESTINATIONS, ...WORLD_LANDMARKS])]
const field = 'min-w-0 w-full border-0 bg-transparent px-3 py-3 text-sm text-[#0F172A] outline-none placeholder:text-slate-500 dark:text-white'
const label = 'mb-1 block text-[11px] font-semibold text-slate-500'
const cell = 'min-w-0 flex-1 border-b border-slate-200 px-2 py-1 sm:border-b-0 sm:border-r last:border-0'

function SelectField({ title, value, onChange, options, wide = false }: { title: string; value: string; onChange: (value: string) => void; options: string[]; wide?: boolean }) {
  return <label data-search-field={title} className={cell + (wide ? ' sm:min-w-[250px] sm:flex-[1.7]' : title === 'Trip type' ? ' sm:min-w-[174px] sm:flex-[0.9]' : '')}><span className={label}>{title}</span><select className={field + (title === 'Trip type' ? ' min-w-[132px]' : '')} value={value} onChange={e => onChange(e.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select></label>
}
function TextField({ title, value, onChange, placeholder, type = 'text' }: { title: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <label data-search-field={title} className={cell + (type === 'date' ? ' sm:min-w-[150px]' : '')}><span className={label}>{title}</span><input className={field} type={type} value={value} placeholder={placeholder} autoComplete="off" onChange={e => onChange(e.target.value)} /></label>
}

function LocationField({ fieldId, title, value, onChange, placeholder, options = [], countryCode }: { fieldId: string; title: string; value: string; onChange: (value: string) => void; placeholder: string; options?: string[]; countryCode?: string }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const [remote, setRemote] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => { const onOpen=(e:Event)=>setOpen((e as CustomEvent<string>).detail===fieldId); const outside=(e:PointerEvent)=>{if(!rootRef.current?.contains(e.target as Node))setOpen(false)}; const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)}; window.addEventListener('trexifly:location-open',onOpen); document.addEventListener('pointerdown',outside); document.addEventListener('keydown',esc); return ()=>{window.removeEventListener('trexifly:location-open',onOpen);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',esc)} },[fieldId])
  const local = useMemo(() => {
    const curated:Record<string,string[]> = {
      ae:['Dubai, United Arab Emirates','Abu Dhabi, United Arab Emirates','Sharjah, United Arab Emirates','Dubai Mall, Downtown Dubai, United Arab Emirates','Burj Khalifa, Downtown Dubai, United Arab Emirates','Atlantis The Palm, Palm Jumeirah, Dubai, United Arab Emirates'],
      pk:['Lahore, Pakistan','Islamabad, Pakistan','Karachi, Pakistan','Peshawar, Pakistan','Quetta, Pakistan','Multan, Pakistan','Skardu, Pakistan','Pearl Continental Lahore, Lahore, Pakistan','Serena Hotel Islamabad, Islamabad, Pakistan','Marriott Karachi, Karachi, Pakistan'],
      sa:['Jeddah, Saudi Arabia','Madinah, Saudi Arabia','Makkah, Saudi Arabia','Riyadh, Saudi Arabia','Makkah Clock Royal Tower, Makkah, Saudi Arabia','Pullman Zamzam Makkah, Makkah, Saudi Arabia','Anwar Al Madinah Mövenpick, Madinah, Saudi Arabia'],
      gb:['London, United Kingdom','Manchester, United Kingdom','Heathrow Airport, London, United Kingdom','Central London, United Kingdom'],
      tr:['Istanbul, Türkiye','Antalya, Türkiye','Ankara, Türkiye','Sabiha Gökçen Airport, Istanbul, Türkiye','Taksim Square, Istanbul, Türkiye']
    }
    const countryNames:Record<string,RegExp>={ae:/United Arab Emirates/i,pk:/Pakistan/i,sa:/Saudi Arabia/i,gb:/United Kingdom/i,tr:/Türkiye|Turkey/i}
    const source=countryCode?[...options.filter(item=>countryNames[countryCode]?.test(item)),...(curated[countryCode]??[])]:options
    return [...new Set(source)].filter(item=>item.toLowerCase().includes(value.trim().toLowerCase())).slice(0,18)
  }, [options, value, countryCode])
  useEffect(() => {
    const term=value.trim()
    if(term.length<2){setRemote([]);setLoading(false);return}
    const controller=new AbortController()
    const timer=window.setTimeout(async()=>{
      setLoading(true)
      const formatPhoton=(items:Array<{properties?:Record<string,string>}>)=>items.map(item=>{
        const a=item.properties??{}
        const name=a.name??a.street??a.locality??a.city
        const city=a.city??a.district??a.county??a.state
        return [name,city,a.country].filter((v,i,arr)=>v&&arr.indexOf(v)===i).join(', ')
      }).filter(Boolean)
      const formatNominatim=(items:Array<{name?:string;display_name?:string;address?:Record<string,string>}>)=>items.map(item=>{
        const a=item.address??{}
        return [item.name??a.amenity??a.tourism??a.road??a.suburb,a.city??a.town??a.village??a.city_district??a.county??a.state,a.country].filter((v,i,arr)=>v&&arr.indexOf(v)===i).join(', ') || item.display_name || ''
      }).filter(Boolean)
      try{
        const primary=await fetch('https://photon.komoot.io/api/?q='+encodeURIComponent(term)+'&limit=12&lang=en',{signal:controller.signal})
        if(!primary.ok)throw new Error('Primary geocoder unavailable')
        const data=await primary.json() as {features?:Array<{properties?:Record<string,string>}>}
        let results=formatPhoton(data.features??[])
        if(!results.length)throw new Error('No primary geocoding results')
        setRemote(results)
      }catch(error){
        if(controller.signal.aborted)return
        try{
          const fallback=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=10&q='+encodeURIComponent(term),{signal:controller.signal})
          if(!fallback.ok)throw new Error('Fallback geocoder unavailable')
          const data=await fallback.json() as Array<{name?:string;display_name?:string;address?:Record<string,string>}>
          setRemote(formatNominatim(data))
        }catch(fallbackError){if(!controller.signal.aborted)setRemote([])}
      }finally{if(!controller.signal.aborted)setLoading(false)}
    },300)
    return ()=>{window.clearTimeout(timer);controller.abort()}
  },[value])
  const suggestions = [...new Set([...local, ...remote])].slice(0,20)
  return <div data-search-field={title} ref={rootRef} className={cell + ' relative min-w-0' + (fieldId === 'flight-from' || fieldId === 'flight-to' ? ' sm:min-w-[160px] sm:flex-[1.1]' : '')}><label className="block"><span className={label}>{title}</span><div className="flex min-w-0 items-center gap-1"><input className={field + ' min-w-0 flex-1'} role="combobox" aria-expanded={open} aria-autocomplete="list" aria-controls={fieldId+'-options'} value={value} placeholder={placeholder} autoComplete="off" onFocus={() => window.dispatchEvent(new CustomEvent('trexifly:location-open',{detail:fieldId}))} onChange={e => {onChange(e.target.value);window.dispatchEvent(new CustomEvent('trexifly:location-open',{detail:fieldId}))}} onKeyDown={e => {if(e.key==='Enter'&&suggestions[0]&&open){e.preventDefault();onChange(suggestions[0]);setOpen(false)}}} /></div></label>
    {open && (suggestions.length > 0 || loading || value.trim().length >= 2) && <div role="listbox" id={fieldId+'-options'} className="absolute left-0 top-full z-[999] mt-1 max-h-64 min-w-[290px] w-max max-w-[min(90vw,480px)] overflow-y-auto rounded-xl border border-orange-100 bg-white p-1.5 shadow-[0_14px_35px_rgba(30,20,10,.18)]">
      {suggestions.map((item) => <button type="button" role="option" aria-selected={item === value} key={item} onMouseDown={e => e.preventDefault()} onClick={() => { onChange(item); setOpen(false) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-800 hover:bg-orange-50"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-orange-100 text-[#FFB800]"><Icon name="mapPin" className="size-4"/></span><span className="min-w-0 flex-1 whitespace-normal break-words leading-5">{item}</span></button>)}
      {loading && <p className="px-3 py-2 text-xs text-slate-500">Searching worldwide locations…</p>}{!loading && suggestions.length === 0 && value.trim().length >= 2 && <p className="px-3 py-3 text-xs text-slate-500">No geocoding match yet. You can still use the entered location.</p>}
    </div>}
    <p className="mt-1 text-[9px] text-slate-500">Worldwide address suggestions · OpenStreetMap contributors · <a href="https://operations.osmfoundation.org/policies/nominatim/" target="_blank" rel="noreferrer" className="underline">Usage policy</a></p>
  </div>
}
function Check({ children }: { children: ReactNode }) { return <label className="inline-flex items-center gap-2 text-xs text-slate-700">{children}</label> }

export function SearchWidget({ initial, compact = false }: { initial?: Partial<SearchQuery>; compact?: boolean }) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [searching, setSearching] = useState(false)
  const [flightValidationError, setFlightValidationError] = useState('')
  const fromUrl = params.get('tab')
  const validTab = TABS.some(t => t.id === fromUrl) ? fromUrl as Tab : undefined
  const [tab, setTab] = useState<Tab>(params.get('type') === 'transfers' || params.get('service') === 'airport-transfer' ? 'transfers' : initial?.type === 'hotels' ? 'hotels' : initial?.type === 'flights' ? 'flights' : initial?.type === 'cars' ? 'cars' : initial?.type === 'tours' ? 'tours' : validTab ?? 'hotels')
  useEffect(() => { if (validTab) setTab(validTab) }, [validTab])
  const [destination, setDestination] = useState(initial?.to ?? 'Dubai')
  const [from, setFrom] = useState(initial?.from ?? 'Lahore (LHE)')
  const [to, setTo] = useState(initial?.to ?? 'Dubai (DXB)')
  const tabRef = useRef<Tab>(tab)
  tabRef.current = tab
  const [highlight, setHighlight] = useState(false)
  const highlightTimer = useRef<number | undefined>(undefined)
  useEffect(() => {
    const onDestination = (event: Event) => {
      const detail = (event as CustomEvent<{ destination?: string; flight?: string }>).detail
      if (!detail?.destination) return
      setDestination(detail.destination)
      setTo(detail.flight ?? detail.destination)
      const current = tabRef.current
      if (current === 'transfers') setDropoff(detail.destination)
      if (current === 'cars') setPickup(detail.destination)
      setHighlight(true)
      window.clearTimeout(highlightTimer.current)
      highlightTimer.current = window.setTimeout(() => setHighlight(false), 2600)
    }
    window.addEventListener('trexifly:select-destination', onDestination)
    return () => {
      window.removeEventListener('trexifly:select-destination', onDestination)
      window.clearTimeout(highlightTimer.current)
    }
  }, [])
  const [depart, setDepart] = useState(initial?.out ?? isoIn(21))
  const [back, setBack] = useState(initial?.back ?? isoIn(28))
  const [trip, setTrip] = useState('Round-trip')
  const [adults, setAdults] = useState(initial?.adults ?? 2)
  const [children, setChildren] = useState(initial?.children ?? 0)
  const [infants, setInfants] = useState(0)
  const [roomCount, setRoomCount] = useState(initial?.rooms ?? 1)
  const [childAges, setChildAges] = useState<number[]>(() => Array.from({ length: initial?.children ?? 0 }, (_, index) => Math.min(12, Math.max(2, initial?.childAges?.[index] ?? 2))))
  const [guestOpen, setGuestOpen] = useState(false)
  const guestSelectorRef = useRef<HTMLDivElement>(null)
  useEffect(() => { setGuestOpen(false) }, [tab])
  useEffect(() => {
    if (!guestOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!guestSelectorRef.current?.contains(event.target as Node)) setGuestOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setGuestOpen(false) }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown) }
  }, [guestOpen])
  const [cabinClass, setCabinClass] = useState(initial?.pax?.match(/(Economy|Business|First Class)/i)?.[1] ?? 'Economy')
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
  const [driverAgeValue, setDriverAgeValue] = useState('35')
  const [luggage, setLuggage] = useState('2 bags')

  const copy = useMemo(() => ({
    hotels: ['Find your next stay', 'Search deals on hotels, homes, and much more...'],
    flights: ['Search hundreds of flight sites at once.', 'Compare routes, schedules and booking options in one place.'],
    cars: ['Car rentals for any kind of trip', 'Great cars at great prices from the biggest rental companies'],
    tours: ['Attractions, activities, and experiences', 'Discover new activities and experiences to match your interests and travel style'],
    transfers: ['Book your airport transfer', 'Easy transportation between the airport and your accommodations'],
  } as Record<Tab, string[]>)[tab], [tab])

  const guestSelector = (showRooms: boolean, showCabin: boolean) => (
    <div ref={guestSelectorRef} className={cell + ' trexifly-guest-selector relative z-[60] min-w-[175px] lg:w-[190px] lg:flex-none'}>
      <span className={label}>Travellers{showRooms ? ' & rooms' : ''}</span>
      <button type="button" aria-expanded={guestOpen} aria-label="Choose passengers, child ages, rooms and cabin class" onClick={() => setGuestOpen(open => !open)} className="trexifly-guest-toggle relative w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-left text-sm font-semibold text-slate-800 hover:border-[#FF5500]">
        <span className="block min-w-0 truncate pr-6 text-gray-900 dark:text-white">{adults} {adults === 1 ? 'Adult' : 'Adults'}, {children} {children === 1 ? 'Child' : 'Children'}{showCabin ? ', ' + infants + (infants === 1 ? ' Infant' : ' Infants') : ''}{showRooms ? ' \u2022 ' + roomCount + (roomCount === 1 ? ' Room' : ' Rooms') : ''}{showCabin ? ' \u2022 ' + cabinClass : ''}</span>
        <Icon name="chevronDown" className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-300" />
      </button>
      {guestOpen && <div className="trexifly-guest-menu absolute left-0 top-full z-[100] mt-2 w-[min(90vw,360px)] rounded-2xl border border-orange-100 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,.2)]">
        <div className="flex items-center justify-between border-b border-slate-100 py-3">
          <div><p className="text-sm font-bold text-slate-800">Adults</p><p className="text-xs text-slate-500">Ages 18 or above</p></div>
          <div className="flex items-center gap-3"><button type="button" aria-label="Remove adult" disabled={adults <= 1} onClick={() => setAdults(value => Math.max(1, value - 1))} className="grid size-8 place-items-center rounded-full border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-white"><Icon name="minus" className="size-4" /></button><span className="w-4 text-center text-sm font-semibold text-gray-900 dark:text-white">{adults}</span><button type="button" aria-label="Add adult" disabled={adults >= (showCabin ? 9 : 5)} onClick={() => setAdults(value => Math.min(showCabin ? 9 : 5, value + 1))} className="grid size-8 place-items-center rounded-full border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-white">+</button></div>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 py-3">
          <div><p className="text-sm font-bold text-slate-800">Children</p><p className="text-xs text-slate-500">Ages 2 to 12</p></div>
          <div className="flex items-center gap-3"><button type="button" aria-label="Remove child" disabled={children <= 0} onClick={() => { const count=Math.max(0,children-1); setChildren(count); setChildAges(ages=>ages.slice(0,count)) }} className="grid size-8 place-items-center rounded-full border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-white"><Icon name="minus" className="size-4" /></button><span className="w-4 text-center text-sm font-semibold text-gray-900 dark:text-white">{children}</span><button type="button" aria-label="Add child" disabled={children >= (showCabin ? 9 : 5)} onClick={() => { setChildren(count=>Math.min(showCabin ? 9 : 5,count+1)); setChildAges(ages=>ages.length<(showCabin ? 9 : 5)?[...ages,2]:ages) }} className="grid size-8 place-items-center rounded-full border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-white">+</button></div>
        </div>
        {children > 0 && <div className="space-y-2 border-b border-slate-100 py-3">{Array.from({length:children},(_,index)=><label key={index} className="flex items-center justify-between gap-3 text-sm"><span className="font-medium text-slate-700">Child {index+1} age</span><select aria-label={'Child '+(index+1)+' age'} value={String(childAges[index]??2)} onChange={event=>setChildAges(ages=>Array.from({length:children},(_,i)=>i===index?Number(event.target.value):(ages[i]??2)))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white">{Array.from({length:11},(_,i)=>i+2).map(age=><option key={age} value={age}>{age} years</option>)}</select></label>)}</div>}
        {showCabin && <div className="flex items-center justify-between border-b border-slate-100 py-3"><div><p className="text-sm font-bold text-slate-800">Infants</p><p className="text-xs text-slate-500">Under 2 years</p></div><div className="flex items-center gap-3"><button type="button" aria-label="Remove infant" disabled={infants<=0} onClick={() => setInfants(value=>Math.max(0,value-1))} className="grid size-8 place-items-center rounded-full border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-white"><Icon name="minus" className="size-4" /></button><span className="w-4 text-center text-sm font-semibold text-gray-900 dark:text-white">{infants}</span><button type="button" aria-label="Add infant" disabled={infants>=9} onClick={() => setInfants(value=>Math.min(9,value+1))} className="grid size-8 place-items-center rounded-full border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-white">+</button></div></div>}
        {showRooms && <div className="flex items-center justify-between border-b border-slate-100 py-3"><p className="text-sm font-bold text-slate-800">Rooms</p><div className="flex items-center gap-3"><button type="button" aria-label="Remove room" disabled={roomCount<=1} onClick={()=>setRoomCount(value=>Math.max(1,value-1))} className="grid size-8 place-items-center rounded-full border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-white"><Icon name="minus" className="size-4" /></button><span className="w-4 text-center text-sm font-semibold text-gray-900 dark:text-white">{roomCount}</span><button type="button" aria-label="Add room" disabled={roomCount>=6} onClick={()=>setRoomCount(value=>Math.min(6,value+1))} className="grid size-8 place-items-center rounded-full border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-white">+</button></div></div>}
        {showCabin && <label className="block py-3"><span className="mb-1 block text-sm font-bold text-slate-800">Cabin class</span><select aria-label="Cabin class" value={cabinClass} onChange={event=>setCabinClass(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"><option className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">Economy</option><option className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">Business</option><option className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">First Class</option></select></label>}
        <button type="button" onClick={()=>setGuestOpen(false)} className="mt-2 w-full rounded-lg bg-[#FF5500] px-4 py-2.5 text-sm font-bold text-white">Done</button>
      </div>}
    </div>
  )

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (tab === 'flights' && (!isValidFlightAirport(from) || !isValidFlightAirport(to))) {
      setFlightValidationError('Please enter or select recognised airport locations with valid IATA codes for both From and To.')
      return
    }
    setFlightValidationError('')
    setSearching(true)
    try {
      const type = tab === 'hotels' ? 'hotels' : tab === 'flights' ? 'flights' : tab === 'tours' ? 'tours' : tab === 'cars' ? 'cars' : 'transfers'
      const query = new URLSearchParams({ type })
      if (tab === 'flights') {
        query.set('from', from); query.set('to', to); query.set('out', depart); query.set('back', trip === 'One-way' ? depart : back)
        query.set('adults', String(adults)); query.set('children', String(children)); query.set('infants', String(infants))
        query.set('childAges', childAges.slice(0, children).join(',')); query.set('cabin', cabinClass)
        query.set('pax', cabinClass); query.set('tripType', trip === 'One-way' ? 'one-way' : 'round-trip')
      } else if (tab === 'hotels') {
        query.set('to', destination); query.set('out', depart); query.set('back', back); query.set('adults', String(adults)); query.set('children', String(children)); query.set('rooms', String(roomCount)); query.set('childAges', childAges.slice(0, children).join(',')); query.set('pax', adults + (adults === 1 ? ' adult' : ' adults') + ' / ' + children + (children === 1 ? ' child' : ' children') + ' / ' + roomCount + (roomCount === 1 ? ' room' : ' rooms'))
      } else if (tab === 'cars') {
        query.set('from', pickup); query.set('to', carDifferent ? dropoff : pickup); query.set('out', depart); query.set('back', back); query.set('vehicle', 'Standard'); query.set('pickupTime', pickupTime); query.set('dropTime', dropTime); query.set('driverAge', driverAgeValue)
      } else if (tab === 'tours') {
        query.set('to', destination); query.set('out', activityDate || depart); query.set('back', activityDate || back); query.set('duration', '5-7 days'); query.set('pkg', 'Private')
      } else {
        query.set('from', pickup); query.set('to', dropoff); query.set('out', depart); query.set('back', transferType === 'Return' ? back : depart); query.set('pax', passengers); query.set('passengers', passengers.replace(/\D/g, '') || '2'); query.set('luggage', luggage.replace(/\D/g, '') || '2'); query.set('service', 'airport-transfer'); query.set('pickupTime', pickupTime); query.set('dropTime', dropTime)
      }

      await navigate(`/results?${query.toString()}`)
    } catch (error) {
      console.error('Trexifly search navigation failed:', error)
    } finally {
      setSearching(false)
    }
  }

  const tabNav = <div role="tablist" aria-label="Travel search type" className="flex flex-wrap gap-2">
    {TABS.map(item => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => { setGuestOpen(false); setTab(item.id); if (!compact) { const next = new URLSearchParams(params); next.set('tab', item.id); setParams(next, { replace: true }) } }} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${compact ? (tab === item.id ? 'border-[#FF5500] bg-orange-50 text-[#FF5500] shadow-sm' : 'border-orange-100 bg-white text-slate-700 hover:border-[#FF5500] hover:bg-orange-50') : (tab === item.id ? 'border-[#FF5500] bg-[#FF5500] text-white shadow-[0_8px_20px_rgba(255,85,0,.28)]' : 'border-orange-100 bg-white text-slate-800 shadow-[0_5px_16px_rgba(15,23,42,.08)] hover:border-[#FF5500] hover:bg-orange-50')}`}><Icon name={item.icon} className={`size-4 ${compact ? (tab === item.id ? 'text-[#FF5500]' : 'text-[#D97706]') : (tab === item.id ? 'text-white' : 'text-[#FF5500]')}`} />{item.label}</button>)}
  </div>

  return <section id="search-widget" className={compact ? 'w-full' : 'w-full'}>
    {!compact && <div className="mb-5 text-[#111111]"><h1 className="max-w-3xl text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#111111] sm:text-4xl lg:text-[2.8rem]">{tab === 'flights' ? <>Search <span className="text-[#FF5500] underline decoration-orange-300 decoration-2 underline-offset-4">hundreds of flight sites</span> at once.</> : tab === 'hotels' ? <>Find your <span className="text-[#FF5500]">next stay</span></> : tab === 'cars' ? <>Car rentals for <span className="text-[#FF5500]">any kind of trip</span></> : tab === 'tours' ? <>Attractions, activities, and <span className="text-[#FF5500]">experiences</span></> : <>Book your <span className="text-[#FF5500]">airport transfer</span></>}</h1><p className="mt-2 max-w-2xl text-sm font-medium text-slate-700 sm:text-base">{copy[1]}</p></div>}

    {compact && <div className="mb-3">{tabNav}</div>}
    <form onSubmit={submit} className={'rounded-2xl border border-orange-100 bg-white p-2 shadow-[0_18px_48px_rgba(15,23,42,.12)] ring-1 ring-orange-50' + (highlight ? ' search-flash' : '')}>
      {flightValidationError && tab === 'flights' && <p role="alert" className="m-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{flightValidationError}</p>}
      {tab === 'hotels' && <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-stretch">
        <LocationField fieldId="hotel-destination" title="Destination" value={destination} onChange={setDestination} placeholder="Search worldwide cities and destinations" options={LOCATIONS} />
        <TextField title="Check-in" value={depart} onChange={setDepart} placeholder="Check-in" type="date" />
        <TextField title="Check-out" value={back} onChange={setBack} placeholder="Check-out" type="date" />
        {guestSelector(true, false)}
        <button className="m-1 rounded-xl bg-[#FF5500] px-6 py-3 text-sm font-bold text-white shadow-sm shadow-orange-200 hover:bg-[#E64A00]">Search</button>
      </div>}
      {tab === 'hotels' && <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 px-3 pt-3"><Check><input type="checkbox" checked={entireHome} onChange={e => setEntireHome(e.target.checked)} className="size-4 accent-[#FF5500]"/>I'm looking for an entire home or apartment</Check><Check><input type="checkbox" checked={workTrip} onChange={e => setWorkTrip(e.target.checked)} className="size-4 accent-[#FF5500]"/>I'm traveling for work</Check></div>}
      {tab === 'flights' && <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-stretch">
        <SelectField title="Trip type" value={trip} onChange={setTrip} options={['Round-trip','One-way']} />
        <LocationField fieldId="flight-from" title="From" value={from} onChange={setFrom} placeholder="City or airport worldwide" options={FLIGHT_LOCATIONS} />
        <LocationField fieldId="flight-to" title="To" value={to} onChange={setTo} placeholder="Search worldwide city or airport" options={FLIGHT_LOCATIONS.filter(a => a !== from)} />
        <FlightDatePicker value={depart} onChange={setDepart} returnValue={back} onReturnChange={setBack} origin={from} destination={to} tripType={trip} onTripTypeChange={setTrip} />
        {guestSelector(false, true)}
        <button className="m-1 rounded-xl bg-[#FF5500] px-6 py-3 text-sm font-bold text-white shadow-sm shadow-orange-200 hover:bg-[#E64A00]">Search</button>
      </div>}
      {tab === 'cars' && <><div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-stretch">
        <LocationField fieldId="car-pickup" title="Pick-up location" value={pickup} onChange={setPickup} placeholder="Airport, city, or station worldwide" options={LOCATIONS} />
        <TextField title="Pick-up date" value={depart} onChange={setDepart} placeholder="Pick-up date" type="date" />
        <TextField title="Time" value={pickupTime} onChange={setPickupTime} placeholder="10:00 AM" type="time" />
        <TextField title="Drop-off date" value={back} onChange={setBack} placeholder="Drop-off date" type="date" />
        <TextField title="Time" value={dropTime} onChange={setDropTime} placeholder="10:00 AM" type="time" />
        <button className="m-1 rounded-xl bg-[#FF5500] px-6 py-3 text-sm font-bold text-white shadow-sm shadow-orange-200 hover:bg-[#E64A00]">Search</button>
      </div><div className="trexifly-car-options flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 px-3 pt-3"><label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={carDifferent} onChange={e => setCarDifferent(e.target.checked)} className="size-4 accent-[#FF5500]" />Drop car off at different location</label><div className="w-44"><SelectField title="Driver age" value={driverAgeValue} onChange={setDriverAgeValue} options={['18','21','25','30','35','40','50','60','65','70']} /></div></div>{carDifferent && <div className="trexifly-car-dropoff mt-2 px-2"><LocationField fieldId="car-dropoff" title="Drop-off location" value={dropoff} onChange={setDropoff} placeholder="Choose worldwide drop-off location" options={LOCATIONS} /></div>}</>}
      {tab === 'tours' && <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-stretch">
        <LocationField fieldId="tour-destination" title="Destination" value={destination} onChange={setDestination} placeholder="Search any city worldwide" options={LOCATIONS} />
        <TextField title="Dates" value={activityDate} onChange={setActivityDate} placeholder="Select dates" type="date" />
        <button className="m-1 rounded-xl bg-[#FF5500] px-6 py-3 text-sm font-bold text-white shadow-sm shadow-orange-200 hover:bg-[#E64A00]">Search</button>
      </div>}
      {tab === 'transfers' && <><div className="flex gap-5 px-3 pb-3 pt-1"><label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="transfer-type" checked={transferType === 'One-way'} onChange={() => setTransferType('One-way')} className="accent-[#FF5500]" />One-way</label><label className="flex items-center gap-2 text-sm text-slate-700"><input type="radio" name="transfer-type" checked={transferType === 'Return'} onChange={() => setTransferType('Return')} className="accent-[#FF5500]" />Return</label></div><div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-stretch">
        <LocationField fieldId="transfer-pickup" title="Pick-up location" value={pickup} onChange={setPickup} placeholder="Airport, city or address worldwide" options={LOCATIONS} />
        <LocationField fieldId="transfer-destination" title="Destination" value={dropoff} onChange={setDropoff} placeholder="Hotels, landmarks or addresses in pickup country" options={LOCATIONS} />
        <TextField title="Pick-up date" value={depart} onChange={setDepart} placeholder="Date" type="date" />
        <TextField title="Pick-up time" value={pickupTime} onChange={setPickupTime} placeholder="Time" type="time" />
        <SelectField title="Passengers" value={passengers} onChange={setPassengers} options={['1 passenger','2 passengers','3 passengers','4 passengers','5 passengers','6 passengers']} />
        <SelectField title="Luggage" value={luggage} onChange={setLuggage} options={['0 bags','1 bag','2 bags','3 bags','4 bags','5 bags','6 bags','7 bags','8 bags']} />
        <button className="m-1 rounded-xl bg-[#FF5500] px-6 py-3 text-sm font-bold text-white shadow-sm shadow-orange-200 hover:bg-[#E64A00]">Search</button>
      </div></>}
    </form>
    {searching && <div role="status" aria-live="polite" className="fixed inset-0 z-[200] grid place-items-center bg-[#FF5500]/95 p-6 text-center text-white backdrop-blur-md"><div className="w-full max-w-sm"><div className="mx-auto grid size-44 place-items-center rounded-[2rem] border border-white/70 bg-white/20 shadow-[0_25px_80px_rgba(90,25,0,.35)] animate-pulse"><img src="/trexifly-logo.png" alt="Trexifly" className="w-36 rounded-xl bg-white p-2 shadow-xl"/></div><h2 className="mt-8 text-xl font-extrabold">Trexifly is scanning partner routes &amp; rates...</h2><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/30"><div className="h-full w-2/3 animate-pulse rounded-full bg-white"/></div><p className="mt-3 text-xs text-white/85">Preparing your comparison</p></div></div>}
    {!compact && tab === 'flights' && <div className="mt-6 grid grid-cols-3 gap-3"><img onError={imgFallback} className="h-24 w-full rounded-xl object-cover sm:h-32" src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=85" alt="Dubai skyline"/><img onError={imgFallback} className="h-24 w-full rounded-xl object-cover sm:h-32" src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=85" alt="London city"/><img onError={imgFallback} className="h-24 w-full rounded-xl object-cover sm:h-32" src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=700&q=85" alt="Istanbul skyline"/></div>}
    {!compact && tab === 'tours' && <div className="mt-6"><h2 className="mb-3 text-sm font-bold text-[#171A20]">Top destinations</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[['Dubai','photo-1512453979798-5ea266f8880c'],['London','photo-1513635269975-59663e0ac1ad'],['Istanbul','photo-1524231757912-21f4fe3a7200'],['Hunza Valley','photo-1544735716-392fe2489ffa'],['Skardu','photo-1589553416260-f586c8f1514f']].map(([name,img])=><div key={name} className="relative h-28 overflow-hidden rounded-xl sm:h-32"><img src={`https://images.unsplash.com/${img}?auto=format&fit=crop&w=700&q=85`} alt={name} onError={imgFallback} className="size-full object-cover"/><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-sm font-bold text-white">{name}</span></div>)}</div></div>}
    {!compact && tab === 'transfers' && <div className="mt-6 grid gap-3 sm:grid-cols-3">{[['Flight tracking','We monitor your flight arrival details.'],['One clear price','Know the fare before you travel.'],['Tried and true service','Choose a vehicle class for your journey.']].map(([title,desc])=><div key={title} className="rounded-xl border border-white/20 bg-white/10 p-4 text-white"><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-white/75">{desc}</p></div>)}</div>}
  </section>
}




