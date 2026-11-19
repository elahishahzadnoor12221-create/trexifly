import { useEffect, useMemo, useState } from 'react'
import { Icon } from './Icons'
import { imgFallback } from '../lib/imageFallback'

type Category = 'Northern Pakistan' | 'Middle East' | 'Europe' | 'Global Hubs'
type Place = {
  name: string
  country: string
  category: Category
  image: string
  tagline: string
  /** Text pre-filled into the hotel / activity destination field. */
  query: string
  /** Airport label pre-filled into the flight "To" field. */
  flight: string
  whatsapp?: boolean
}

const FILTERS = ['All Destinations', 'Northern Pakistan', 'Middle East', 'Europe', 'Global Hubs'] as const
type Filter = (typeof FILTERS)[number]

// Every photo below was checked to return HTTP 200 from images.unsplash.com.
const PLACES: Place[] = [
  { name: 'Hunza Valley', country: 'Pakistan', category: 'Northern Pakistan', image: 'photo-1612128952123-88ed13410495', tagline: 'Attabad Lake, forts and Karakoram views', query: 'Hunza Valley, Pakistan', flight: 'Gilgit (GIL)', whatsapp: true },
  { name: 'Skardu', country: 'Pakistan', category: 'Northern Pakistan', image: 'photo-1667922210719-566cbfec2b11', tagline: 'Glacier rivers, high lakes and cold deserts', query: 'Skardu, Pakistan', flight: 'Skardu (KDU)', whatsapp: true },
  { name: 'Swat Valley', country: 'Pakistan', category: 'Northern Pakistan', image: 'photo-1655403991405-2aa41eb455cc', tagline: 'Pine forests, rivers and Mahodand Lake', query: 'Swat Valley, Pakistan', flight: 'Islamabad (ISB)', whatsapp: true },
  { name: 'Naran & Kaghan', country: 'Pakistan', category: 'Northern Pakistan', image: 'photo-1572707582365-0ee1c8e71173', tagline: 'Alpine lakes and Saif-ul-Muluk scenery', query: 'Naran Kaghan, Pakistan', flight: 'Islamabad (ISB)', whatsapp: true },
  { name: 'Dubai', country: 'United Arab Emirates', category: 'Middle East', image: 'photo-1512453979798-5ea266f8880c', tagline: 'Skyline stays, shopping and desert escapes', query: 'Dubai, United Arab Emirates', flight: 'Dubai (DXB)' },
  { name: 'Makkah & Madinah', country: 'Saudi Arabia', category: 'Middle East', image: 'photo-1591604129939-f1efa4d9f7fa', tagline: 'Umrah and Ziyarat journeys', query: 'Makkah, Saudi Arabia', flight: 'Jeddah (JED)' },
  { name: 'Istanbul', country: 'T\u00fcrkiye', category: 'Middle East', image: 'photo-1524231757912-21f4fe3a7200', tagline: 'Where Europe meets Asia', query: 'Istanbul, T\u00fcrkiye', flight: 'Istanbul (IST)' },
  { name: 'London', country: 'United Kingdom', category: 'Europe', image: 'photo-1513635269975-59663e0ac1ad', tagline: 'Royal landmarks and world-class museums', query: 'London, United Kingdom', flight: 'London (LHR)' },
  { name: 'Baku', country: 'Azerbaijan', category: 'Europe', image: 'photo-1596306499398-8d88944a5ec4', tagline: 'Flame Towers and the Caspian waterfront', query: 'Baku, Azerbaijan', flight: 'Baku (GYD)' },
  { name: 'New York', country: 'United States', category: 'Global Hubs', image: 'photo-1499092346589-b9b6be3e94b2', tagline: 'Iconic skyline and city discovery', query: 'New York, United States', flight: 'New York (JFK)' },
  { name: 'Tokyo', country: 'Japan', category: 'Global Hubs', image: 'photo-1536098561742-ca998e48cbcc', tagline: 'Modern culture and city escapes', query: 'Tokyo, Japan', flight: 'Tokyo (HND)' },
  { name: 'Kuala Lumpur', country: 'Malaysia', category: 'Global Hubs', image: 'photo-1768466246117-d64a918528af', tagline: 'Twin towers and street-food capital', query: 'Kuala Lumpur, Malaysia', flight: 'Kuala Lumpur (KUL)' },
]

const imageUrl = (id: string, width: number) => 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=' + width + '&q=80'
const whatsappLink = (name: string) => 'https://wa.me/923244921494?text=' + encodeURIComponent('Hello Trexifly, I would like trip planning assistance for ' + name + ', Pakistan.')

type Suggestion = { name: string; admin1?: string; country?: string }

export function Destinations() {
  const [filter, setFilter] = useState<Filter>('All Destinations')
  const [query, setQuery] = useState('')
  const [remote, setRemote] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const activate = () => setFilter('All Destinations')
    window.addEventListener('trexifly:open-worldwide', activate)
    return () => window.removeEventListener('trexifly:open-worldwide', activate)
  }, [])

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) { setRemote([]); setLoading(false); return }
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setLoading(true)
      fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(term) + '&count=15&language=en&format=json', { signal: controller.signal })
        .then((response) => (response.ok ? (response.json() as Promise<{ results?: Suggestion[] }>) : Promise.reject()))
        .then((data) => setRemote(data.results ?? []))
        .catch(() => { if (!controller.signal.aborted) setRemote([]) })
        .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [query])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return PLACES.filter((place) =>
      (filter === 'All Destinations' || place.category === filter) &&
      (!term || (place.name + ' ' + place.country).toLowerCase().includes(term)),
    )
  }, [filter, query])

  // Pre-fills the search bar, scrolls to it and highlights it (see SearchWidget).
  const choose = (destination: string, flight?: string) => {
    window.dispatchEvent(new CustomEvent('trexifly:select-destination', { detail: { destination, flight: flight ?? destination } }))
    const target = document.getElementById('search-widget')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
  }

  return (
    <section id="destinations" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#FF5500]">Explore worldwide</p>
        <h2 className="mt-2 text-2xl font-extrabold text-[#242424] sm:text-3xl">World Destinations</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Pick a destination to jump straight to the search bar with it pre-filled, then compare live flights, hotels and more with our partners.</p>

        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Destination categories">
          {FILTERS.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={filter === name}
              onClick={() => setFilter(name)}
              className={'rounded-full border px-4 py-2 text-sm font-semibold transition ' + (filter === name
                ? 'border-[#FF5500] bg-[#FF5500] text-white shadow-md shadow-orange-200'
                : 'border-orange-100 bg-white text-slate-700 hover:border-[#FF5500] hover:text-[#FF5500]')}
            >
              {name}
            </button>
          ))}
        </div>

        <label className="mt-5 flex max-w-2xl items-center gap-3 rounded-2xl border-2 border-[#FF5500] bg-white px-4 py-3">
          <Icon name="globe" className="size-5 shrink-0 text-[#FF5500]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search any city, country or destination worldwide" className="w-full bg-transparent text-sm outline-none" aria-label="Search worldwide destinations" />
        </label>
        {query.trim().length >= 2 && (remote.length > 0 || loading) && (
          <div className="mt-2 max-w-2xl rounded-xl border border-orange-100 bg-white p-2 shadow-lg">
            {remote.map((place, index) => {
              const label = [place.name, place.admin1, place.country].filter(Boolean).join(', ')
              return <button key={place.name + index} type="button" onClick={() => choose(label)} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-orange-50">{label}</button>
            })}
            {loading && <p className="px-3 py-2 text-xs text-slate-500">Searching worldwide{'\u2026'}</p>}
          </div>
        )}

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((place) => (
            <article key={place.name} className="group flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-[0_8px_24px_rgba(255,85,0,.08)] transition duration-300 hover:-translate-y-1.5 hover:border-[#FF5500] hover:shadow-[0_18px_40px_rgba(255,85,0,.24)]">
              <button
                type="button"
                onClick={() => choose(place.query, place.flight)}
                aria-label={'Search ' + place.name + ': compare flights and hotels'}
                className="flex flex-1 flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF5500]"
              >
                <span className="relative block aspect-[4/3] w-full overflow-hidden bg-orange-50">
                  <img
                    src={imageUrl(place.image, 800)}
                    srcSet={imageUrl(place.image, 480) + ' 480w, ' + imageUrl(place.image, 800) + ' 800w, ' + imageUrl(place.image, 1200) + ' 1200w'}
                    sizes="(min-width:1280px) 290px, (min-width:1024px) 31vw, (min-width:640px) 46vw, 92vw"
                    alt={place.name + ', ' + place.country}
                    loading="lazy"
                    decoding="async"
                    onError={imgFallback}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#C93400] shadow">{place.country}</span>
                </span>
                <span className="flex flex-1 flex-col p-4">
                  <span className="text-lg font-extrabold text-[#242424]">{place.name}</span>
                  <span className="mt-1 text-sm leading-5 text-slate-600">{place.tagline}</span>
                  <span className="mt-auto pt-4 text-sm font-bold text-[#FF5500]">Compare flights &amp; hotels <span aria-hidden="true">{'\u2192'}</span></span>
                </span>
              </button>
              {place.whatsapp && (
                <a href={whatsappLink(place.name)} target="_blank" rel="noreferrer" className="mx-4 mb-4 block rounded-lg border border-[#FF5500] px-3 py-2 text-center text-xs font-bold text-[#D94700] hover:bg-orange-50">Ask on WhatsApp</a>
              )}
            </article>
          ))}
        </div>
        {visible.length === 0 && <p className="mt-8 rounded-xl bg-orange-50 p-5 text-sm text-slate-600">No featured destination matches. Try one of the worldwide suggestions above.</p>}
        <p className="mt-5 text-xs text-slate-500">Worldwide suggestions use Open-Meteo geocoding. Results are destination names, not live travel availability.</p>
      </div>
    </section>
  )
}
