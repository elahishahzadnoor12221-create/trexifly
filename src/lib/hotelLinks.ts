import { getAffiliatePartners } from './affiliates'
import type { SearchQuery } from './data'

export type HotelProviderLink = {
  id: string
  name: string
  url: string
  marker: string
}

/**
 * Exposes only independently verified short links. The current hotel links
 * failed clean redirect verification, so this intentionally returns [] until
 * a hotel partner link passes the same check.
 */
export function buildHotelProviderLinks(_query: SearchQuery): HotelProviderLink[] {
  return getAffiliatePartners('hotels').map(partner => ({
    id: partner.id,
    name: partner.name,
    url: partner.url,
    marker: '806576',
  }))
}
