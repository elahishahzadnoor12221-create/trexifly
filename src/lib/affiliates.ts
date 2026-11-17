import type { ProviderId, SearchQuery } from './data'

/**
 * Affiliate wiring.
 *
 * 1. Drop your programme IDs into `AFFILIATE_IDS` (Travelpayouts, Booking.com
 *    partner programme, Agoda, Trip.com affiliate, ...).
 * 2. Every "View Deal" button already points at `buildAffiliateUrl(provider, query)`
 *    and opens in a new tab with `rel="sponsored"`.
 * 3. For white-label banner/booking widgets use `<AffiliateWidgetSlot />`.
 */
export const AFFILIATE_IDS: Partial<Record<ProviderId, string>> = {
  aviasales: '601763',
  // booking: 'YOUR_AID',
  // agoda: 'YOUR_CID',
  // aviasales: 'YOUR_MARKER',
  // trip: 'YOUR_ALLIANCE_ID',
  // kiwi: 'YOUR_AFFILID',
  // expedia: 'YOUR_AFFCID',
}

/** Query-string name each network uses for its tracking ID. */
const ID_PARAM: Record<ProviderId, string> = {
  booking: 'aid',
  agoda: 'cid',
  aviasales: 'marker',
  trip: 'Allianceid',
  kiwi: 'affilid',
  expedia: 'affcid',
}

const BASE_URL: Record<ProviderId, string> = {
  booking: 'https://www.booking.com/searchresults.html',
  agoda: 'https://www.agoda.com/search',
  aviasales: 'https://www.aviasales.com/search',
  trip: 'https://www.trip.com/search',
  kiwi: 'https://www.kiwi.com/en/search/results',
  expedia: 'https://www.expedia.com/search',
}

/** Booking.com and Agoda deep-link the destination under their own key. */
const DEST_PARAM: Partial<Record<ProviderId, string>> = {
  booking: 'ss',
  agoda: 'textToSearch',
}

function adultsFrom(pax: string): number {
  const adults = Number.parseInt(pax, 10)
  return Number.isFinite(adults) && adults > 0 ? adults : 1
}

export function buildAffiliateUrl(provider: ProviderId, query: SearchQuery): string {
  const url = new URL(BASE_URL[provider])
  const params = url.searchParams
  const city = query.type === 'cars' ? query.from : query.to

  params.set(DEST_PARAM[provider] ?? 'destination', city)
  if (query.type === 'flights') {
    params.set('origin', query.from)
    params.set('depart', query.out)
    params.set('return', query.back)
  } else {
    params.set('checkIn', query.out)
    params.set('checkOut', query.back)
  }
  if (query.type === 'cars') params.set('vehicle', query.vehicle)
  if (query.type === 'tours') {
    params.set('duration', query.duration)
    params.set('package', query.pkg)
  }
  params.set('adults', String(adultsFrom(query.pax)))

  const id = AFFILIATE_IDS[provider]
  if (id) params.set(ID_PARAM[provider], id)

  return url.toString()
}
