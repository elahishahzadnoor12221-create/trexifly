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

test('flight results render recent fare data and the verified affiliate marker', async ({ page }) => {
  await page.route(flightSearchUrl, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, markerId: '806576', cached: true, offers: [sampleOffer] }),
  }))
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-01&back=2026-12-01')
  await expect(page.getByRole('heading', { name: 'Recent flight fares' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Emirates' })).toBeVisible()
  await expect(page.getByText('Non-stop')).toBeVisible()
  const booking = page.getByRole('link', { name: 'Continue' })
  await expect(booking).toHaveAttribute('href', sampleOffer.bookingUrl)
  await expect(booking).toHaveAttribute('data-affiliate-marker', '806576')
})

test('flight results show a clear no-cache state instead of invented fares', async ({ page }) => {
  await page.route(flightSearchUrl, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, markerId: '806576', cached: true, offers: [] }),
  }))
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-01&back=2026-12-01')
  await expect(page.getByRole('heading', { name: 'No recent cached fares for this route' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Search on Aviasales/ })).toHaveAttribute('href', sampleOffer.bookingUrl)
})
