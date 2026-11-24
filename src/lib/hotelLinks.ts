import type { SearchQuery } from './data'

export type HotelProviderLink = {
  id: string
  name: string
  url: string
  marker: string
  tracking: 'dynamic' | 'fallback'
}

/** Build same-origin server redirects; raw partner URLs and credentials stay server-side. */
export function buildHotelProviderLinks(query: SearchQuery): HotelProviderLink[] {
  const params = new URLSearchParams({
    id: 'trip',
    to: query.to,
    out: query.out,
    back: query.back,
    adults: String(query.adults ?? 2),
    children: String(query.children ?? 0),
    rooms: String(query.rooms ?? 1),
    childAges: (query.childAges ?? []).slice(0, query.children ?? 0).join(','),
  })
  return [{
    id: 'trip',
    name: 'Trip.com',
    url: `/api/affiliates/link?${params.toString()}`,
    marker: '806576',
    tracking: 'dynamic',
  }]
}
