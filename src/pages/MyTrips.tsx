import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { deleteTrip, getTrips, saveTrip, updateTrip, type TripCategory, type TripRecord, type TripStatus } from '../lib/trips'

const SUPPORT_WHATSAPP = 'https://wa.me/923244921494'
const STATUSES: TripStatus[] = ['Saved', 'Partner Checkout', 'Reference Added', 'Confirmed', 'Cancelled']
const CATEGORIES: Array<{ value: TripCategory; label: string }> = [
  { value: 'flights', label: 'Flights' },
  { value: 'hotels', label: 'Hotels' },
  { value: 'cars', label: 'Car rentals' },
  { value: 'activities', label: 'Activities' },
  { value: 'transfers', label: 'Airport transfers' },
]

function supportUrl(trip: TripRecord) {
  const message = [
    'Hello Trexifly Support, I need help with a trip.',
    'Trip: ' + trip.title,
    'Category: ' + trip.category,
    'Partner: ' + (trip.partner || 'Not specified'),
    'Partner booking reference: ' + (trip.bookingReference || 'Not added'),
    'Status: ' + trip.status,
    'Please advise on the next steps.',
  ].join('\n')
  return SUPPORT_WHATSAPP + '?text=' + encodeURIComponent(message)
}

export function MyTrips() {
  const [trips, setTrips] = useState<TripRecord[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<TripCategory>('flights')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [references, setReferences] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')

  useEffect(() => { setTrips(getTrips()) }, [])

  const addTrip = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    saveTrip({ title, category, origin, destination, departureDate, returnDate })
    setTrips(getTrips())
    setTitle('')
    setOrigin('')
    setDestination('')
    setDepartureDate('')
    setReturnDate('')
    setNotice('Itinerary saved on this device.')
  }

  const saveReference = (trip: TripRecord) => {
    const bookingReference = (references[trip.id] ?? trip.bookingReference).trim()
    if (!bookingReference) {
      setNotice('Enter the partner booking reference first.')
      return
    }
    setTrips(updateTrip(trip.id, { bookingReference, status: 'Reference Added' }))
    setNotice('Partner reference saved.')
  }

  const changeStatus = (id: string, status: TripStatus) => {
    setTrips(updateTrip(id, { status }))
    setNotice('Trip status updated. Statuses are self-reported, not verified by the supplier.')
  }

  return <div className="min-h-[70vh] bg-[#FFF7F2] pb-16 pt-8 dark:bg-slate-950">
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <Link to="/" className="text-xs font-semibold text-[#FF5500] hover:underline">Back to Trexifly</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#FF5500]">Your travel workspace</p><h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">My Trips</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Save itineraries, add partner references and keep your trip notes together.</p></div>
        <span className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold text-[#B93800]">Booking Tracker</span>
      </div>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
        Trips are stored locally in this browser on this device; they are not synced to an account or Trexifly server. Booking status is manually entered by you and is not supplier verification. For confirmations, changes, cancellations and refunds, the booking provider remains responsible. Do not store passport, payment-card or other sensitive documents here.
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Save an itinerary</h2>
        <form onSubmit={addTrip} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">Trip name<input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Islamabad to Dubai" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#FF5500] dark:border-slate-700 dark:bg-slate-800 dark:text-white"/></label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Category<select value={category} onChange={e => setCategory(e.target.value as TripCategory)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">{CATEGORIES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">From / pickup<input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Origin or pickup location" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"/></label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">To / destination<input required value={destination} onChange={e => setDestination(e.target.value)} placeholder="Destination or drop-off" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"/></label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Start date<input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"/></label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Return / end date<input type="date" min={departureDate || undefined} value={returnDate} onChange={e => setReturnDate(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"/></label>
          <div className="sm:col-span-2"><button type="submit" className="rounded-xl bg-[#FF5500] px-5 py-3 text-sm font-bold text-white hover:bg-[#E64A00]">Save itinerary</button></div>
        </form>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Your saved trips <span className="text-sm font-semibold text-slate-500">({trips.length})</span></h2><button type="button" onClick={() => setTrips(getTrips())} className="text-xs font-bold text-[#D94700]">Refresh</button></div>
        {notice && <p role="status" className="mt-3 rounded-xl bg-orange-50 p-3 text-xs text-[#9A3412]">{notice}</p>}
        {!trips.length ? <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900"><p className="font-bold text-slate-800 dark:text-white">No trips saved yet</p><p className="mt-2 text-sm text-slate-500">Save an itinerary here or choose a verified partner from a Trexifly results page.</p></div> : <div className="mt-4 space-y-4">{trips.map(trip => <article key={trip.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase text-[#B93800]">{trip.category}</span><h3 className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">{trip.title}</h3><p className="mt-1 text-xs text-slate-500">{[trip.origin, trip.destination].filter(Boolean).join(' → ')}</p><p className="mt-1 text-xs text-slate-500">{[trip.departureDate, trip.returnDate].filter(Boolean).join(' to ')}</p></div><button type="button" onClick={() => setTrips(deleteTrip(trip.id))} className="text-xs font-semibold text-rose-700 hover:underline">Remove</button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Partner</p><p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{trip.partner || 'Not selected yet'}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Booking reference</p><div className="mt-1 flex gap-2"><input aria-label={'Booking reference for ' + trip.title} value={references[trip.id] ?? trip.bookingReference} onChange={e => setReferences(current => ({...current,[trip.id]:e.target.value}))} placeholder="Add partner reference" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"/><button type="button" onClick={() => saveReference(trip)} className="rounded-lg bg-[#FF5500] px-3 py-2 text-xs font-bold text-white">Save</button></div></div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-700"><label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">Status<select aria-label={'Status for ' + trip.title} value={trip.status} onChange={e => changeStatus(trip.id,e.target.value as TripStatus)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">{STATUSES.map(status => <option key={status}>{status}</option>)}</select></label><a href={supportUrl(trip)} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#FF5500] px-3 py-2 text-xs font-bold text-[#D94700] hover:bg-orange-50">Request Trexifly support ↗</a></div>
        </article>)}</div>}
      </section>
    </div>
  </div>
}
