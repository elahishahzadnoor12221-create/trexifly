/**
 * Trexifly provider configuration.
 * Affiliate handoffs use Travelpayouts-generated short links with the expected
 * provider-specific host; inventory API flags remain separate.
 * Unverified inventory/partners remain disabled.
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
    affiliateUrl: 'https://klook.tpx.lv/LvAH7l4w',
    partners: [
      { name: 'Trip.com', url: 'https://www.trip.com/t/SsY6ZaegIX2', allianceId: '11493329' },
      { name: 'Klook', url: 'https://klook.tpx.lv/LvAH7l4w' },
      { name: 'KKday', url: 'https://kkday.tpx.lv/x5gqHfDJ' },
    ],
    requiresServerApi: true,
  },
  cars: [
    { name: 'AutoEurope', url: 'https://autoeurope.tpx.lv/1NuZscel' },
    { name: 'QEEQ', url: 'https://qeeq.tpx.lv/n9oGqafJ' },
  ],
  activities: [
    { name: 'Tiqets', url: 'https://tiqets.tpx.lv/sSYehXWU' },
  ],
  transfers: {
    provider: 'GetTransfer.com',
    url: 'https://gettransfer.tpx.lv/yYXGNhMm',
    partners: [
      { name: 'GetTransfer.com', url: 'https://gettransfer.tpx.lv/yYXGNhMm' },
      { name: 'Intui.travel', url: 'https://intui.tpx.lv/6QOOPhJd' },
      { name: 'Kiwitaxi', url: 'https://kiwitaxi.tpx.lv/wN8KUFkg' },
    ],
    requiresServerApi: true,
  },
  // Demo inventory with direct, untracked provider URLs is intentionally hidden.
  demoOffers: [],
});
