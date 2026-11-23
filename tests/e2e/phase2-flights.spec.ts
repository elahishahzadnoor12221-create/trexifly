import { test, expect } from '@playwright/test'

const flightSearchUrl = '**/api/flights/search?*'
const sampleOffer = {
  id: 'LHE-DXB-EK-204',
  price: 100,
  currency: 'USD',
  airlineCode: 'EK',
  flightNumber: '204',
  departureAt: '2026-12-01T10:00:00Z',
  arrivalAt: '2026-12-01T12:00:00Z',
  stops: 0,
  durationMinutes: 120,
  bookingUrl: 'https://aviasales.tpx.lv/ZOqzJHaf',
  markerId: '806576',
}

test('flight results show exact fare labels, route link and expandable fare details', async ({ page }) => {
  await page.route(flightSearchUrl, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, markerId: '806576', cached: true, offers: [sampleOffer] }),
  }))
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-01&back=2026-12-01')
  await expect(page.getByRole('heading', { name: 'Recent flight fares' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Emirates' })).toBeVisible()
  await expect(page.getByText('Flight 204 · Non-stop')).toBeVisible()
  await expect(page.getByText('$200')).toBeVisible()
  const booking = page.getByRole('link', { name: 'Compare & Book' })
  await expect(booking).toHaveAttribute('href', 'https://aviasales.tpx.lv/ZOqzJHaf')
  const details = page.getByText('Fare conditions & flight details')
  await expect(details).toBeVisible()
  await details.click()
  await expect(page.getByText('Personal item — 1 pc per passenger')).toBeVisible()
  await expect(page.getByText(/Passenger summary: 2 adult\(s\)/)).toBeVisible()
})

test('flight results show the same-month flexible cached fares and exact-date fallback', async ({ page }) => {
  await page.route(flightSearchUrl, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, markerId: '806576', cached: true, offers: [], flexibleOffers: [{ ...sampleOffer, id: 'LHE-DXB-EK-206', departureAt: '2026-12-06T10:00:00Z', price: 88 }] }),
  }))
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-01&back=2026-12-01')
  await expect(page.getByRole('heading', { name: 'No exact-date cached fare' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Flexible dates in December 2026.*Estimated total for 2 passengers/ })).toBeVisible()
  await expect(page.getByText('$176').first()).toBeVisible()
  const flexibleFare = page.getByRole('link', { name: /Sun, Dec 6/ })
  await expect(flexibleFare).toHaveAttribute('href', 'https://aviasales.tpx.lv/ZOqzJHaf')
  const liveFare = page.getByRole('link', { name: /Compare & Book on Official Partner/ })
  await expect(liveFare).toHaveAttribute('href', 'https://aviasales.tpx.lv/ZOqzJHaf')
})

test('round-trip flight request and Aviasales link preserve dates, passengers and cabin', async ({ page }) => {
  let requestUrl = ''
  await page.route(flightSearchUrl, route => {
    requestUrl = route.request().url()
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, offers: [] }) })
  })
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-01&back=2026-12-05&adults=2&children=1&pax=2%20adults%20%2F%201%20child%20%2F%20Business')
  await expect(page.getByRole('heading', { name: 'No exact-date cached fare' })).toBeVisible()
  const request = new URL(requestUrl)
  expect(request.searchParams.get('origin')).toBe('LHE')
  expect(request.searchParams.get('destination')).toBe('DXB')
  expect(request.searchParams.get('departure_at')).toBe('2026-12-01')
  expect(request.searchParams.get('return_at')).toBe('2026-12-05')
  expect(request.searchParams.get('one_way')).toBe('false')
  expect(request.searchParams.get('adults')).toBe('2')
  expect(request.searchParams.get('children')).toBe('1')
  expect(request.searchParams.get('trip_class')).toBe('C')
  await expect(page.getByRole('link', { name: /Compare & Book on Official Partner/ })).toHaveAttribute('href', 'https://aviasales.tpx.lv/ZOqzJHaf')
})
