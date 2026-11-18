import type { TripType } from './data'

export type AffiliateCategory = TripType | 'transfers'

export type AffiliatePartner = {
  id: string
  name: string
  category: AffiliateCategory
  url: string
}

/** Verified Travelpayouts Partner ID supplied by the account owner. */
export const TRAVELPAYOUTS_MARKER_ID = '806576'
export const AFFILIATE_IDS = { aviasales: TRAVELPAYOUTS_MARKER_ID } as const

/**
 * Exact generated Travelpayouts links. These are short partner URLs and must
 * remain intact: do not append unrelated marker/query parameters to them.
 */
export const TRAVELPAYOUTS_PARTNERS: Record<AffiliateCategory, AffiliatePartner[]> = {
  flights: [
    { id: 'aviasales', name: 'Aviasales', category: 'flights', url: 'https://aviasales.tpx.lv/ZOqzJHaf' },
  ],
  hotels: [
    { id: 'klook-hotels', name: 'Klook Hotels', category: 'hotels', url: 'https://klook.tpx.lv/agWneWmu' },
    { id: 'kkday', name: 'KKday Package Tours', category: 'hotels', url: 'https://kkday.tpx.lv/2zFYXTf7' },
  ],
  cars: [
    { id: 'autoeurope', name: 'AutoEurope', category: 'cars', url: 'https://autoeurope.tpx.lv/1NuZscel' },
    { id: 'qeeq', name: 'QEEQ Global Car Rental', category: 'cars', url: 'https://qeeq.tpx.lv/xVJH8wOZ' },
  ],
  tours: [
    { id: 'tiqets', name: 'Tiqets', category: 'tours', url: 'https://tiqets.tpx.lv/JkNGKSuf' },
  ],
  transfers: [
    { id: 'kiwitaxi', name: 'Kiwitaxi', category: 'transfers', url: 'https://kiwitaxi.tpx.lv/rPk61mni' },
    { id: 'gettransfer', name: 'GetTransfer.com', category: 'transfers', url: 'https://gettransfer.tpx.lv/dt5dWuQv' },
    { id: 'intui', name: 'Intui.travel', category: 'transfers', url: 'https://intui.tpx.lv/XuaKpcpV' },
  ],
}

export function getAffiliatePartners(category: AffiliateCategory): AffiliatePartner[] {
  return TRAVELPAYOUTS_PARTNERS[category]
}

/** Return the official generated short link for a category/provider slot. */
export function buildAffiliateUrl(category: AffiliateCategory, partnerIndex = 0): string {
  const partners = getAffiliatePartners(category)
  if (!partners.length) throw new Error(`No affiliate partner configured for ${category}`)
  return partners[partnerIndex % partners.length].url
}
