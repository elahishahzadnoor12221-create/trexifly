import { test, expect } from '@playwright/test'

function isoDate(offsetDays: number, from = new Date()) {
  const date = new Date(from)
  date.setDate(date.getDate() + offsetDays)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function blockGeocoding(page: import('@playwright/test').Page) {
  await page.route(/^https:\/\/.*/, route => route.abort())
}

test('Car search blocks past pick-up dates', async ({ page }) => {
  await blockGeocoding(page)
  await page.goto('/?tab=cars', { waitUntil: 'domcontentloaded' })
  const pickup = page.locator('[data-search-field="Pick-up date"] input')
  await pickup.fill('2020-01-01')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  expect(await pickup.evaluate(element => (element as HTMLInputElement).validity.rangeUnderflow)).toBe(true)
  await expect(page).not.toHaveURL(/\/results\?type=cars/)
})

test('Car search requires drop-off after pick-up, including same-day time order', async ({ page }) => {
  await blockGeocoding(page)
  await page.goto('/?tab=cars', { waitUntil: 'domcontentloaded' })
  const date = isoDate(5)
  await page.locator('[data-search-field="Pick-up date"] input').fill(date)
  await page.locator('[data-search-field="Drop-off date"] input').fill(date)
  await page.locator('[data-search-field="Time"] input').first().fill('10:00')
  await page.locator('[data-search-field="Time"] input').nth(1).fill('10:00')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('drop-off time must be later')
  await expect(page).not.toHaveURL(/\/results\?type=cars/)
})

test('Car partner handoffs remain tracked and disclose manual re-entry where provider URL parameters are unsupported', async ({ page }) => {
  await page.goto('/results?type=cars&from=Dubai%20International%20Airport&to=Abu%20Dhabi&out=2026-12-10&back=2026-12-12&pickupTime=10%3A00&dropTime=12%3A00&driverAge=35')
  await expect(page.getByRole('heading', { name: 'Continue with a verified booking partner' })).toBeVisible()
  for (const id of ['autoeurope', 'qeeq']) {
    const link = page.locator(`a[data-affiliate-partner="${id}"]`)
    const url = new URL(await link.getAttribute('href') ?? '', page.url())
    expect(url.pathname).toBe('/api/affiliates/link')
    expect(url.searchParams.get('id')).toBe(id)
    expect(url.searchParams.has('driverAge')).toBe(false)
  }
  await expect(page.getByText(/Car dates, driver age.*may need to be entered again/i)).toBeVisible()
})

test('Transfer route is carried to Kiwitaxi and unverified flight-tracking or guaranteed-price claims are absent', async ({ page }) => {
  await page.goto('/results?type=transfers&service=airport-transfer&from=Dubai%20International%20Airport&to=Downtown%20Dubai&out=2026-12-10&back=2026-12-10&pickupTime=10%3A00&passengers=2&luggage=2')
  const link = page.locator('a[data-affiliate-partner="kiwitaxi"]')
  const url = new URL(await link.getAttribute('href') ?? '', page.url())
  expect(url.pathname).toBe('/api/affiliates/link')
  expect(url.searchParams.get('id')).toBe('kiwitaxi')
  expect(url.searchParams.get('from')).toBe('Dubai International Airport')
  expect(url.searchParams.get('to')).toBe('Downtown Dubai')
  const text = (await page.locator('body').innerText()).toLowerCase()
  expect(text).not.toContain('flight tracking')
  expect(text).not.toContain('we monitor your flight')
  expect(text).not.toContain('guaranteed live price')
  expect(text).toContain('airport transfer partners display their own options')
})

test('Tiqets activity handoff uses the safe tracked fallback when destination deep-link parameters are not verified', async ({ page }) => {
  await page.goto('/results?type=tours&to=Paris%2C%20France&out=2026-12-10&back=2026-12-10')
  const link = page.locator('a[data-affiliate-partner="tiqets"]')
  const url = new URL(await link.getAttribute('href') ?? '', page.url())
  expect(url.pathname).toBe('/api/affiliates/link')
  expect(url.searchParams.get('id')).toBe('tiqets')
  expect(url.searchParams.has('to')).toBe(false)
  await expect(page.getByText(/activity dates.*may need to be entered again/i)).toBeVisible()
})
