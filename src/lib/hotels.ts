import type { SearchQuery } from './data'

/**
 * Live hotel inventory is not connected for this Travelpayouts project yet.
 * Keep the listing shape for the results page, but never synthesize properties,
 * ratings, reviews, photos, prices, or availability.
 */
export type HotelListing = {
  id: string
  title: string
  stars: 1 | 2 | 3 | 4 | 5 | 7
  price: number
  score: number
  reviews: number
  neighborhood: string
  address: string
  photoUrl: string
  priceUnit: string
  subtitle: string
  perks: string[]
}

export function generateHotelInventory(_query: SearchQuery): HotelListing[] {
  return []
}
