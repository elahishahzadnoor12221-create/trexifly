import { test, expect } from '@playwright/test'

const deepLink = 'https://aviasales.tpx.lv/phase2-prefilled-test'

test('Flights use the server-generated affiliate deep link when available', async ({ page }) => {
  let requested: URL | undefined
  await page.route('**/api/flights/search?*', async route => {
    requested = new URL(route.request().url())
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, searchUrl: deepLink, deepLinkReady: true, offers: [], flexibleOffers: [] }),
    })
  })
  await page.route('**/api/flights/calendar?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, prices: [] }) }))
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-10&back=2026-12-14&adults=2&children=1&infants=1&pax=Business')
  await expect.poll(() => requested?.searchParams.get('infants')).toBe('1')
  await expect.poll(() => requested?.searchParams.get('trip_class')).toBe('C')
  await expect(page.getByText('Your route, dates, cabin and passenger details will be pre-filled on the booking partner.')).toBeVisible()
  const partnerLink = page.getByRole('link', { name: 'Search pre-filled' })
  await expect(partnerLink).toHaveAttribute('href', deepLink)
})
