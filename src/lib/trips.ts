export type TripCategory = 'flights' | 'hotels' | 'cars' | 'activities' | 'transfers'
export type TripStatus = 'Saved' | 'Partner Checkout' | 'Reference Added' | 'Confirmed' | 'Cancelled'

export type TripRecord = {
  id: string
  title: string
  category: TripCategory
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  partner: string
  partnerUrl: string
  bookingReference: string
  status: TripStatus
  createdAt: string
  updatedAt: string
}

export type TripDraft = Pick<TripRecord, 'title' | 'category' | 'origin' | 'destination' | 'departureDate' | 'returnDate'> &
  Partial<Pick<TripRecord, 'partner' | 'partnerUrl' | 'bookingReference' | 'status'>>

const STORAGE_KEY = 'trexifly.my-trips.v1'

export function getTrips(): TripRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is TripRecord =>
      !!item && typeof item === 'object' && typeof item.id === 'string' &&
      typeof item.title === 'string' && typeof item.category === 'string' &&
      typeof item.status === 'string',
    )
  } catch {
    return []
  }
}

function persist(trips: TripRecord[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

export function saveTrip(draft: TripDraft): TripRecord {
  const now = new Date().toISOString()
  const trip: TripRecord = {
    id: globalThis.crypto?.randomUUID?.() ?? `trip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: draft.title.trim(),
    category: draft.category,
    origin: draft.origin.trim(),
    destination: draft.destination.trim(),
    departureDate: draft.departureDate,
    returnDate: draft.returnDate,
    partner: draft.partner ?? '',
    partnerUrl: draft.partnerUrl ?? '',
    bookingReference: draft.bookingReference ?? '',
    status: draft.status ?? 'Saved',
    createdAt: now,
    updatedAt: now,
  }
  persist([trip, ...getTrips()])
  return trip
}

export function recordPartnerCheckout(draft: TripDraft): TripRecord {
  return saveTrip({ ...draft, status: 'Partner Checkout' })
}

export function updateTrip(id: string, changes: Partial<Pick<TripRecord, 'bookingReference' | 'status' | 'partner'>>): TripRecord[] {
  const updated = getTrips().map(trip => {
    if (trip.id !== id) return trip
    const bookingReference = changes.bookingReference ?? trip.bookingReference
    const status = changes.status ?? (bookingReference.trim() ? 'Reference Added' : trip.status)
    return { ...trip, ...changes, bookingReference, status, updatedAt: new Date().toISOString() }
  })
  persist(updated)
  return updated
}

export function deleteTrip(id: string): TripRecord[] {
  const updated = getTrips().filter(trip => trip.id !== id)
  persist(updated)
  return updated
}
