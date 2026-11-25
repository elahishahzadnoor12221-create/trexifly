import { expect, test } from '@playwright/test'

test('header keeps the logo separate from category navigation and exposes Airport Transfers at 1280px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const logo = page.getByRole('banner').getByRole('link', { name: 'Trexifly home' })
  const nav = page.locator('.site-header nav[aria-label="Travel categories"]:visible')
  await expect(logo).toBeVisible()
  await expect(nav).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Stays' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Airport Transfers' })).toBeVisible()
  const logoBox = await logo.boundingBox()
  const navBox = await nav.boundingBox()
  expect(logoBox).not.toBeNull()
  expect(navBox).not.toBeNull()
  expect(navBox!.y).toBeGreaterThanOrEqual(logoBox!.y + logoBox!.height - 1)
  await page.screenshot({ path: 'artifacts/three-ui-fixes-preview-20261125/header-1280.png', fullPage: true })
})

test('results show the submitted search summary and provider cards for cars, activities and transfers', async ({ page }) => {
  const cases = [
    { url: '/results?type=cars&from=Dubai%20Airport&to=Abu%20Dhabi&out=2026-12-10&back=2026-12-12&pickupTime=10%3A00&dropTime=12%3A00&driverAge=35', expected: ['Dubai Airport', 'Abu Dhabi', '35'] },
    { url: '/results?type=tours&to=Paris%2C%20France&out=2026-12-10&duration=Full-Day&pkg=Private', expected: ['Paris, France', 'Full-Day', 'Private'] },
    { url: '/results?type=transfers&service=airport-transfer&from=Dubai%20Airport&to=Downtown%20Dubai&out=2026-12-10&pickupTime=11%3A30&passengers=3&luggage=2', expected: ['Dubai Airport', 'Downtown Dubai', '3', '2'] },
  ]
  for (const item of cases) {
    await page.goto(item.url, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('region', { name: 'Your Trip Search Summary' })).toBeVisible()
    for (const value of item.expected) await expect(page.getByRole('region', { name: 'Your Trip Search Summary' })).toContainText(value)
    await expect(page.getByRole('heading', { name: 'Continue with a verified booking partner' })).toBeVisible()
    await expect(page.locator('a[data-affiliate-partner]').first()).toBeVisible()
  }
  await page.screenshot({ path: 'artifacts/three-ui-fixes-preview-20261125/transfers-results.png', fullPage: true })
})

test('hotel results show submitted stay details and verified partner links', async ({ page }) => {
  await page.goto('/results?type=hotels&to=Dubai&out=2026-12-10&back=2026-12-14&adults=2&children=1&rooms=2&childAges=7', { waitUntil: 'domcontentloaded' })
  const summary = page.getByRole('region', { name: 'Your Trip Search Summary' })
  await expect(summary).toBeVisible()
  await expect(summary).toContainText('Dubai')
  await expect(summary).toContainText('2 adults / 1 children / 2 rooms')
  await expect(summary).toContainText('7 years')
  await expect(page.getByRole('heading', { name: 'Compare hotel booking partners' })).toBeVisible()
  await expect(page.locator('a[data-affiliate-partner]').first()).toBeVisible()
  await page.screenshot({ path: 'artifacts/three-ui-fixes-preview-20261125/hotels-results.png', fullPage: true })
})

test('flights without an exact-date cached fare show Live Flight Search Ready route card', async ({ page }) => {
  await page.route('**/api/flights/search?*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, cached: true, offers: [], flexibleOffers: [] }),
  }))
  await page.route('**/api/flights/calendar?*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ prices: [] }),
  }))
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-10&back=2026-12-10&adults=2&children=1&infants=0&cabin=Economy', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Live Flight Search Ready' })).toBeVisible()
  const routeCard = page.getByRole('region', { name: 'Live Flight Search Ready' })
  const themeToggle = page.getByRole('button', { name: /Switch to (dark|light) mode/ })
  if ((await themeToggle.getAttribute('aria-pressed')) !== 'true') await themeToggle.click()
  const routeCardStyle = await routeCard.evaluate(element => ({ backgroundColor: getComputedStyle(element).backgroundColor, backgroundImage: getComputedStyle(element).backgroundImage }))
  expect(routeCardStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  expect(routeCardStyle.backgroundImage).toBe('none')
  await expect(routeCard).toContainText('Lahore (LHE) - Dubai (DXB)')
  await expect(routeCard).toContainText(/Dec 10, 2026|10 Dec 2026/)
  await expect(page.getByRole('region', { name: 'Your Trip Search Summary' })).toContainText('2 adults / 1 children / 0 infants')
  const partner = page.getByRole('link', { name: /Continue with partner|Search pre-filled/ })
  await expect(partner).toHaveAttribute('href', 'https://aviasales.tpx.lv/ZOqzJHaf')
  await page.screenshot({ path: 'artifacts/three-ui-fixes-preview-20261125/flights-no-cached-fare.png', fullPage: true })
})
