import { expect, test } from '@playwright/test'

const flightSearchUrl = '**/api/flights/search?*'
const calendarUrl = '**/api/flights/calendar?*'
const sampleOffer = {
  id: 'LHE-DXB-EK-204', price: 100, currency: 'USD', airlineCode: 'EK', flightNumber: '204',
  departureAt: '2026-12-01T10:00:00Z', arrivalAt: '2026-12-01T12:00:00Z',
  stops: 0, durationMinutes: 120, bookingUrl: 'https://www.aviasales.com/search/old?marker=806576', markerId: '806576',
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('trexifly.test.initialized')) {
      localStorage.removeItem('trexifly.my-trips.v1')
      sessionStorage.setItem('trexifly.test.initialized', '1')
    }
  })
})

test('My Trips saves an itinerary, stores a partner reference and supports manual status updates', async ({ page }) => {
  await page.goto('/my-trips')
  await expect(page.getByRole('heading', { name: 'My Trips' })).toBeVisible()
  await page.getByLabel('Trip name').fill('Islamabad to Dubai')
  await page.getByLabel('Category').selectOption('flights')
  await page.getByLabel('From / pickup').fill('Islamabad')
  await page.getByLabel('To / destination').fill('Dubai')
  await page.getByLabel('Start date').fill('2026-12-10')
  await page.getByLabel('Return / end date').fill('2026-12-15')
  await page.getByRole('button', { name: 'Save itinerary', exact: true }).click()
  const trip = page.locator('article').filter({ hasText: 'Islamabad to Dubai' })
  await expect(trip).toBeVisible()
  await expect(trip.getByLabel('Status for Islamabad to Dubai')).toHaveValue('Saved')
  await trip.getByRole('textbox', { name: 'Booking reference for Islamabad to Dubai' }).fill('AB12CD')
  await trip.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(trip.getByLabel('Status for Islamabad to Dubai')).toHaveValue('Reference Added')
  await trip.getByLabel('Status for Islamabad to Dubai').selectOption('Confirmed')
  await expect(trip.getByLabel('Status for Islamabad to Dubai')).toHaveValue('Confirmed')
  await expect(trip.getByRole('link', { name: /Request Trexifly support/ })).toHaveAttribute('href', /wa\.me\/923244921494/)
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('trexifly.my-trips.v1') || '[]'))
  expect(saved).toHaveLength(1)
  expect(saved[0].bookingReference).toBe('AB12CD')
  expect(saved[0].status).toBe('Confirmed')
})

test('Saving a search from results adds the itinerary to My Trips', async ({ page }) => {
  await page.route(flightSearchUrl, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, offers: [sampleOffer], flexibleOffers: [] }),
  }))
  await page.route(calendarUrl, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, prices: [] }),
  }))
  await page.goto('/results?type=flights&from=Islamabad%20(ISB)&to=Dubai%20(DXB)&out=2026-12-10&back=2026-12-15')
  await page.getByRole('button', { name: 'Save itinerary to My Trips' }).click()
  await expect(page.getByRole('status')).toContainText('Itinerary saved')
  await page.goto('/my-trips')
  await expect(page.getByRole('heading', { name: 'Islamabad (ISB) to Dubai (DXB)' })).toBeVisible()
})

test('Partner checkout CTA uses the category-tagged backend redirect with a verified fallback and records Partner Checkout', async ({ page }) => {
  await page.goto('/results?type=cars&from=Heathrow%20Airport&to=Central%20London&out=2026-12-10&back=2026-12-14')
  const link = page.getByRole('link', { name: /Search AutoEurope/ }).first()
  await expect(link).toHaveAttribute('href', /\/api\/affiliates\/link\?id=autoeurope/)
  await expect(link).toHaveAttribute('data-affiliate-fallback', 'https://autoeurope.tpx.lv/1NuZscel')
  await expect(link).toHaveAttribute('data-affiliate-status', 'verified')
  await link.evaluate(el => {
    document.addEventListener('click', event => event.preventDefault(), { once: true, capture: true })
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('trexifly.my-trips.v1') || '[]'))
  expect(saved).toHaveLength(1)
  expect(saved[0].partner).toBe('AutoEurope')
  expect(saved[0].status).toBe('Partner Checkout')
})

test('Verified partner links and the owner-supplied hotel handoff are exposed across all five categories', async ({ page }) => {
  await page.route(flightSearchUrl, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, offers: [sampleOffer], flexibleOffers: [] }),
  }))
  await page.route(calendarUrl, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, prices: [] }),
  }))
  await page.goto('/results?type=flights&from=Islamabad%20(ISB)&to=Dubai%20(DXB)&out=2026-12-10&back=2026-12-15')
  await expect(page.locator('a[data-affiliate-status="verified"]').first()).toHaveAttribute('href', 'https://aviasales.tpx.lv/ZOqzJHaf')
  await expect(page.locator('a[href*="www.aviasales.com/search"]')).toHaveCount(0)

  await page.goto('/results?type=hotels&to=Dubai&out=2026-12-10&back=2026-12-14')
  const tripHotelLink = page.getByRole('link', { name: /Search hotels on Trip.com/ })
  await expect(tripHotelLink).toBeVisible()
  await expect(tripHotelLink).toHaveAttribute('data-affiliate-status', 'dynamic')
  const hotelRedirect = await tripHotelLink.evaluate(node => {
    const url = new URL((node as HTMLAnchorElement).href)
    return {
      pathname: url.pathname,
      id: url.searchParams.get('id'),
      destination: url.searchParams.get('to'),
      departure: url.searchParams.get('out'),
      returnDate: url.searchParams.get('back'),
      adults: url.searchParams.get('adults'),
      children: url.searchParams.get('children'),
      rooms: url.searchParams.get('rooms'),
    }
  })
  expect(hotelRedirect).toEqual({
    pathname: '/api/affiliates/link', id: 'trip', destination: 'Dubai',
    departure: '2026-12-10', returnDate: '2026-12-14', adults: '2', children: '0', rooms: '1',
  })
  await expect(page.getByRole('link', { name: /Search hotels on Klook|Search hotels on KKday/ })).toHaveCount(0)
  await tripHotelLink.evaluate(el => {
    document.addEventListener('click', event => event.preventDefault(), { once: true, capture: true })
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
  const hotelCheckout = await page.evaluate(() => JSON.parse(localStorage.getItem('trexifly.my-trips.v1') || '[]'))
  expect(hotelCheckout).toHaveLength(1)
  expect(hotelCheckout[0].partner).toBe('Trip.com')
  expect(hotelCheckout[0].status).toBe('Partner Checkout')
  await expect(page.locator('.hotel-provider-link')).toHaveCount(0)

  await page.goto('/results?type=cars&from=Heathrow&to=London&out=2026-12-10&back=2026-12-14')
  const carLinks = page.locator('a[data-affiliate-status="verified"]')
  await expect(carLinks).toHaveCount(2)
  const carRedirects = await carLinks.evaluateAll(nodes => nodes.map(node => {
    const anchor = node as HTMLAnchorElement
    const url = new URL(anchor.href)
    return { id: anchor.dataset.affiliatePartner, endpoint: url.pathname, fallback: anchor.dataset.affiliateFallback }
  }))
  expect(carRedirects).toEqual(expect.arrayContaining([
    { id: 'autoeurope', endpoint: '/api/affiliates/link', fallback: 'https://autoeurope.tpx.lv/1NuZscel' },
    { id: 'qeeq', endpoint: '/api/affiliates/link', fallback: 'https://qeeq.tpx.lv/n9oGqafJ' },
  ]))

  await page.goto('/results?type=tours&to=Dubai&out=2026-12-10')
  await expect(page.locator('a[data-affiliate-status="verified"]')).toHaveCount(1)
  await expect(page.locator('a[data-affiliate-status="verified"]').first()).toHaveAttribute('href', /\/api\/affiliates\/link\?id=tiqets/)
  await expect(page.locator('a[data-affiliate-status="verified"]').first()).toHaveAttribute('data-affiliate-fallback', 'https://tiqets.tpx.lv/sSYehXWU')

  await page.goto('/results?type=transfers&service=airport-transfer&from=DXB&to=Dubai%20Marina&out=2026-12-10')
  const transferLinks = page.locator('a[data-affiliate-status="verified"]')
  await expect(transferLinks).toHaveCount(3)
  const transferRedirects = await transferLinks.evaluateAll(nodes => nodes.map(node => {
    const anchor = node as HTMLAnchorElement
    const url = new URL(anchor.href)
    return {
      id: anchor.dataset.affiliatePartner,
      endpoint: url.pathname,
      fallback: anchor.dataset.affiliateFallback,
      from: url.searchParams.get('from'),
      to: url.searchParams.get('to'),
    }
  }))
  expect(transferRedirects).toEqual(expect.arrayContaining([
    { id: 'gettransfer', endpoint: '/api/affiliates/link', fallback: 'https://gettransfer.tpx.lv/yYXGNhMm', from: null, to: null },
    { id: 'intui', endpoint: '/api/affiliates/link', fallback: 'https://intui.tpx.lv/6QOOPhJd', from: null, to: null },
    { id: 'kiwitaxi', endpoint: '/api/affiliates/link', fallback: 'https://kiwitaxi.tpx.lv/wN8KUFkg', from: 'DXB', to: 'Dubai Marina' },
  ]))
})

test('Homepage outbound affiliate CTAs are limited to verified short links', async ({ page }) => {
  await page.goto('/')
  const promo = page.locator('section[aria-labelledby="promo-deals-title"]')
  await expect(promo.getByRole('heading', { name: 'Explore Travel Partner Services' })).toBeVisible()
  const promoLink = promo.locator('a[data-affiliate-status="verified"]')
  await expect(promoLink).toHaveCount(1)
  await expect(promoLink).toHaveAttribute('href', 'https://intui.tpx.lv/6QOOPhJd')
  await expect(promo.getByText('20% OFF First eSIM Order')).toHaveCount(0)
  const affiliateLinks = page.locator('a[data-affiliate-status="verified"]')
  const hrefs = await affiliateLinks.evaluateAll(nodes => nodes.map(node => (node as HTMLAnchorElement).href))
  expect(hrefs.length).toBeGreaterThan(1)
  for (const href of hrefs) {
    expect([
      'https://autoeurope.tpx.lv/1NuZscel',
      'https://qeeq.tpx.lv/n9oGqafJ',
      'https://intui.tpx.lv/6QOOPhJd',
    ]).toContain(href)
  }
  await expect(page.locator('a[href*="europcar.com"], a[href*="hertz.com"], a[href*="getyourguide.com"], a[href*="viator.com"]')).toHaveCount(0)
})
