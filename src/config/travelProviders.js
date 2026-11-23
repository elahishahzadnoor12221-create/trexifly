/**
 * Trexifly provider configuration.
 * Only independently resolved Travelpayouts short links are eligible for
 * outbound booking CTAs. Unverified inventory/partners remain disabled.
 */
export const TRAVEL_PROVIDERS = Object.freeze({
  flights: {
    provider: 'Aviasales',
    enabled: true,
    searchUrl: 'https://aviasales.tpx.lv/ZOqzJHaf',
    requiresServerApi: true,
  },
  stays: {
    provider: 'Hotel partners',
    enabled: false,
    searchUrl: '',
    requiresServerApi: true,
  },
  cars: [
    { name: 'AutoEurope', url: 'https://autoeurope.tpx.lv/1NuZscel' },
    { name: 'QEEQ', url: 'https://qeeq.tpx.lv/xVJH8wOZ' },
  ],
  activities: [
    { name: 'Tiqets', url: 'https://tiqets.tpx.lv/JkNGKSuf' },
  ],
  transfers: {
    provider: 'GetTransfer.com',
    url: 'https://gettransfer.tpx.lv/dt5dWuQv',
    requiresServerApi: true,
  },
  // Demo inventory with direct, untracked provider URLs is intentionally hidden.
  demoOffers: [],
});
