import type { SearchQuery } from './data'
import { AFFILIATE_MARKER_ID } from './affiliates'

export type HotelProviderLink = {
  id: 'agoda' | 'booking' | 'expedia' | 'trip'
  name: string
  url: string
  marker: string
}

function cleanDestination(value: string): string {
  return value.trim().replace(/\s*\([A-Z]{3}\)\s*$/, '') || 'Dubai'
}

/** Build destination- and occupancy-prefilled partner search pages. */
export function buildHotelProviderLinks(query: SearchQuery): HotelProviderLink[] {
  const destination = cleanDestination(query.to)
  const checkin = query.out
  const checkout = query.back
  const adults = Math.max(1, Math.min(30, query.adults ?? 2))
  const children = Math.max(0, Math.min(10, query.children ?? 0))
  const rooms = Math.max(1, Math.min(30, query.rooms ?? 1))
  const ages = (query.childAges ?? []).slice(0, children)
  const marker = AFFILIATE_MARKER_ID

  const booking = new URL('https://www.booking.com/searchresults.html')
  booking.searchParams.set('ss', destination)
  booking.searchParams.set('checkin', checkin)
  booking.searchParams.set('checkout', checkout)
  booking.searchParams.set('group_adults', String(adults))
  booking.searchParams.set('group_children', String(children))
  booking.searchParams.set('no_rooms', String(rooms))
  if (ages.length) booking.searchParams.set('age', ages.join(','))
  booking.searchParams.set('marker', marker)

  const agoda = new URL('https://www.agoda.com/search')
  agoda.searchParams.set('city', destination)
  agoda.searchParams.set('checkIn', checkin)
  agoda.searchParams.set('checkOut', checkout)
  agoda.searchParams.set('adults', String(adults))
  agoda.searchParams.set('children', String(children))
  agoda.searchParams.set('rooms', String(rooms))
  if (ages.length) agoda.searchParams.set('childAges', ages.join(','))
  agoda.searchParams.set('marker', marker)

  const expedia = new URL('https://www.expedia.com/Hotel-Search')
  expedia.searchParams.set('destination', destination)
  expedia.searchParams.set('startDate', checkin)
  expedia.searchParams.set('endDate', checkout)
  expedia.searchParams.set('adults', String(adults))
  expedia.searchParams.set('children', String(children))
  expedia.searchParams.set('rooms', String(rooms))
  if (ages.length) ages.forEach(age => expedia.searchParams.append('childAge', String(age)))
  expedia.searchParams.set('marker', marker)

  const trip = new URL('https://www.trip.com/hotels/list')
  trip.searchParams.set('city', destination)
  trip.searchParams.set('checkin', checkin)
  trip.searchParams.set('checkout', checkout)
  trip.searchParams.set('adult', String(adults))
  trip.searchParams.set('children', String(children))
  trip.searchParams.set('crn', String(rooms))
  if (ages.length) trip.searchParams.set('childages', ages.join(','))
  trip.searchParams.set('marker', marker)

  return [
    { id: 'agoda', name: 'Agoda', url: agoda.toString(), marker },
    { id: 'booking', name: 'Booking.com', url: booking.toString(), marker },
    { id: 'expedia', name: 'Expedia / Hotels.com', url: expedia.toString(), marker },
    { id: 'trip', name: 'Trip.com', url: trip.toString(), marker },
  ]
}
