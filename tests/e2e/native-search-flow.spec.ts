import { test, expect } from '@playwright/test'

const flightSearchUrl = '**/api/flights/search?*'
const calendarUrl = '**/api/flights/calendar?*'
const sampleOffer = {
  id: 'LHE-DXB-EK-204', price: 100, currency: 'USD', airlineCode: 'EK', flightNumber: '204',
  departureAt: '2026-12-01T10:00:00Z', arrivalAt: '2026-12-01T12:00:00Z',
  stops: 0, durationMinutes: 120, bookingUrl: 'https://www.aviasales.com/search/LHE0112DXB?marker=806576', markerId: '806576',
}

test('Flights use native Trexifly results and never load a third-party widget', async ({ page }) => {
  await page.route(flightSearchUrl, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, offers: [sampleOffer], flexibleOffers: [] }),
  }))
  await page.route(calendarUrl, route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, prices: [{ date: '2026-12-01', price: 100, currency: 'USD' }] }),
  }))
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-01&back=2026-12-05&adults=3&children=2&infants=1&pax=Business')
  await expect(page.locator('#root')).not.toBeEmpty()
  await expect(page.getByRole('heading', { name: 'Lahore (LHE) to Dubai (DXB)' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Recent flight fares' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Emirates' })).toBeVisible()
  await expect(page.getByText('Estimated total for 5 passengers')).toBeVisible()
  await expect(page.getByText('$500').first()).toBeVisible()
  await expect(page.getByRole('region', { name: 'Fare calendar' })).toContainText('$500')
  await expect(page.locator('#tpwl-search, #tpwl-tickets, script#tpwl-widget-main')).toHaveCount(0)
  const body = (await page.locator('body').innerText()).toLowerCase()
  expect(body).not.toContain('travelpayouts')
  expect(body).not.toContain('aviasales')
  expect(body).not.toContain('806576')
  expect(await page.locator('.results-page').evaluate(el => getComputedStyle(el).fontFamily)).not.toMatch(/Times New Roman/i)
  expect(await page.locator('.results-page > div').evaluate(el => getComputedStyle(el).paddingLeft)).not.toBe('0px')
})

test('Homepage Flights search navigates to branded Results in the same tab', async ({ page }) => {
  await page.goto('/?tab=flights', { waitUntil: 'domcontentloaded' })
  await page.locator('#search-widget form button').last().click()
  await expect(page).toHaveURL(/\/results\?type=flights/)
  await expect(page.getByRole('heading', { name: /Lahore.*to.*Dubai/ })).toBeVisible()
  await expect(page.locator('input[role="combobox"]').nth(1)).toBeVisible()
})

test('Invalid airport input keeps the validation alert and does not navigate', async ({ page }) => {
  await page.goto('/?tab=flights', { waitUntil: 'domcontentloaded' })
  const airports = page.locator('input[role="combobox"]')
  await airports.nth(0).fill('Somewhere Unknown')
  await airports.nth(1).fill('Dubai (DXB)')
  const originalUrl = page.url()
  await page.locator('#search-widget form button').last().click()
  await expect(page.getByRole('alert')).toContainText('recognised airport locations')
  await expect(page).toHaveURL(originalUrl)
})

test('Hotels cards use clean Trexifly partner copy and UTF-8 labels', async ({ page }) => {
  await page.goto('/results?type=hotels&to=Dubai&out=2026-12-15&back=2026-12-20&adults=2&children=0&rooms=1')
  await expect(page.getByText('Hotel booking partners').first()).toBeVisible()
  await expect(page.getByText(/Unverified hotel booking buttons remain hidden/i).first()).toBeVisible()
  await expect(page.locator('.hotel-provider-link')).toHaveCount(0)
  await expect(page.getByText(/Hotel partner links are temporarily unavailable/i).first()).toBeVisible()
  const hotelText = await page.locator('body').innerText()
  expect(hotelText).not.toMatch(/Sample listing|Sample score|simulated reviews|Partner link verification|Illustrative rating|Provider details may differ/i)
  expect(hotelText).not.toMatch(/travelpayouts|â†|Â·|â˜/i)
})

test('Hotels partner cards remain readable in light and dark themes', async ({ page }) => {
  await page.goto('/results?type=hotels&to=Dubai&out=2026-12-15&back=2026-12-20')
  const card = page.locator('article').first()
  await expect(card).toBeVisible()
  await expect(card.getByText('Hotel booking partners').first()).toBeVisible()
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await expect(card).toBeVisible()
  await expect(card.locator('.hotel-provider-link')).toHaveCount(0)
  await page.evaluate(() => document.documentElement.classList.remove('dark'))
  await expect(card).toBeVisible()
})
