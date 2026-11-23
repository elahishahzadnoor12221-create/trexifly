import type { TripType } from './data'

export type AffiliateCategory = TripType | 'transfers'

export type AffiliatePartner = {
  id: string
  name: string
  category: AffiliateCategory
  url: string
  status: 'verified' | 'unverified'
}

/** Affiliate tracking marker supplied by the account owner. */
export const AFFILIATE_MARKER_ID = '806576'
export const AFFILIATE_IDS = { aviasales: AFFILIATE_MARKER_ID } as const

/**
 * Exact generated Travelpayouts short links. A link is exposed to customers
 * only after its redirect was independently confirmed to return HTTP 200.
 * HTTP 403/429 destinations remain configured but are not eligible for CTAs.
 */
export const AFFILIATE_PARTNERS: Record<AffiliateCategory, AffiliatePartner[]> = {
  flights: [
    { id: 'aviasales', name: 'Aviasales', category: 'flights', url: 'https://aviasales.tpx.lv/ZOqzJHaf', status: 'verified' },
  ],
  hotels: [
    { id: 'klook-hotels', name: 'Klook Hotels', category: 'hotels', url: 'https://klook.tpx.lv/agWneWmu', status: 'unverified' },
    { id: 'kkday', name: 'KKday Package Tours', category: 'hotels', url: 'https://kkday.tpx.lv/2zFYXTf7', status: 'unverified' },
  ],
  cars: [
    { id: 'autoeurope', name: 'AutoEurope', category: 'cars', url: 'https://autoeurope.tpx.lv/1NuZscel', status: 'verified' },
    { id: 'qeeq', name: 'QEEQ Global Car Rental', category: 'cars', url: 'https://qeeq.tpx.lv/xVJH8wOZ', status: 'verified' },
  ],
  tours: [
    { id: 'tiqets', name: 'Tiqets', category: 'tours', url: 'https://tiqets.tpx.lv/JkNGKSuf', status: 'verified' },
  ],
  transfers: [
    { id: 'kiwitaxi', name: 'Kiwitaxi', category: 'transfers', url: 'https://kiwitaxi.tpx.lv/rPk61mni', status: 'unverified' },
    { id: 'gettransfer', name: 'GetTransfer.com', category: 'transfers', url: 'https://gettransfer.tpx.lv/dt5dWuQv', status: 'verified' },
    { id: 'intui', name: 'Intui.travel', category: 'transfers', url: 'https://intui.tpx.lv/XuaKpcpV', status: 'verified' },
  ],
}

export function getAffiliatePartners(category: AffiliateCategory): AffiliatePartner[] {
  return AFFILIATE_PARTNERS[category].filter(partner => partner.status === 'verified')
}

export function isVerifiedAffiliateUrl(value: string): boolean {
  return Object.values(AFFILIATE_PARTNERS).some(partners =>
    partners.some(partner => partner.status === 'verified' && partner.url === value),
  )
}

export function findVerifiedAffiliatePartner(value: string): AffiliatePartner | null {
  for (const partners of Object.values(AFFILIATE_PARTNERS)) {
    const partner = partners.find(item => item.status === 'verified' && item.url === value)
    if (partner) return partner
  }
  return null
}

/** Return a verified generated short link for a category/provider slot. */
export function buildAffiliateUrl(category: AffiliateCategory, partnerIndex = 0): string {
  const partners = getAffiliatePartners(category)
  if (!partners.length) return ''
  return partners[partnerIndex % partners.length].url
}
