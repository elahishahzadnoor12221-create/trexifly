/**
 * Trexifly provider configuration.
 * Keep credentials server-side. Public affiliate IDs are safe to configure here.
 * These links are templates, not live inventory APIs; configure provider APIs
 * on the server before advertising real-time availability or guaranteed prices.
 */
export const TRAVEL_PROVIDERS = Object.freeze({
flights: {
    provider: 'Aviasales',
    enabled: true,
    searchUrl: 'https://www.aviasales.com/',
    requiresServerApi: true,
  },
  stays: {
    provider: 'Booking.com',
    enabled: true,
    searchUrl: 'https://www.booking.com/',
    requiresServerApi: true,
  },
  cars: [
    { name: 'DiscoverCars', url: 'https://www.discovercars.com/' },
    { name: 'Europcar', url: 'https://www.europcar.com/' },
    { name: 'Hertz', url: 'https://www.hertz.com/' },
    { name: 'Sixt', url: 'https://www.sixt.com/' },
  ],
  activities: [
    { name: 'Viator', url: 'https://www.viator.com/' },
    { name: 'GetYourGuide', url: 'https://www.getyourguide.com/' },
  ],
  transfers: {
    provider: 'Kiwitaxi',
    url: 'https://kiwitaxi.com/',
    requiresServerApi: true,
  },
  demoOffers: [
    { id: 'europcar-demo', category: 'cars', provider: 'Europcar', title: 'Economy car · indicative sample', priceFrom: 42, currency: 'USD', live: false, url: 'https://www.europcar.com/' },
    { id: 'hertz-demo', category: 'cars', provider: 'Hertz', title: 'Compact car · indicative sample', priceFrom: 49, currency: 'USD', live: false, url: 'https://www.hertz.com/' },
    { id: 'serena-demo', category: 'stays', provider: 'Serena Hotels', title: 'Pakistan hotel collection · indicative sample', priceFrom: 95, currency: 'USD', live: false, url: 'https://www.serenahotels.com/' },
    { id: 'pc-demo', category: 'stays', provider: 'Pearl Continental', title: 'Pakistan city and resort stays · indicative sample', priceFrom: 110, currency: 'USD', live: false, url: 'https://www.pchotels.com/' },
    { id: 'northern-4x4-demo', category: 'activities', provider: 'Northern Pakistan 4x4 Tours', title: 'Private northern areas 4×4 tour · indicative sample', priceFrom: 180, currency: 'USD', live: false, url: 'https://www.getyourguide.com/' },
  ],
});
