import { test, expect } from '@playwright/test'

test('Flights stay inside Trexifly with the official Travelpayouts live widget', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('pageerror', error => runtimeErrors.push(error.message))
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-15&back=2026-12-20&adults=3&children=2&infants=1&cabin=Business&tripType=round-trip')
  await expect(page.locator('#root')).not.toBeEmpty()
  await expect(page.getByRole('heading', { name: 'Lahore (LHE) to Dubai (DXB)' })).toBeVisible()
  await expect(page.getByText('Live flight search and results')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Official booking partners' })).toHaveCount(0)
  await expect(page.locator('#tpwl-search')).toBeVisible()
  await expect(page.locator('#tpwl-tickets')).toHaveCount(1)
  await expect(page.getByPlaceholder('Departure from')).toBeVisible()
  await expect(page.getByPlaceholder('Arrival in')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Search flights' })).toBeVisible()
  await expect(page.locator('script#tpwl-widget-main')).toHaveAttribute('src', 'https://tpwdg.com/wl_web/main.js?wl_id=24943')
  await expect.poll(() => page.evaluate(() => (window as Window & { TPWL_CONFIGURATION?: { resultsURL?: string } }).TPWL_CONFIGURATION?.resultsURL)).toBe('https://trexifly.com/results')
  await expect(page).toHaveURL(/\/results$/)
  expect(runtimeErrors).toEqual([])
})

test('Homepage Flights search navigates to branded Results in the same tab', async ({ page }) => {
  await page.goto('/?tab=flights')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page).toHaveURL(/\/results\?type=flights/)
  await expect(page.getByRole('heading', { name: /Lahore.*to.*Dubai/ })).toBeVisible()
  await expect(page.getByPlaceholder('Arrival in')).toBeVisible()
})

test('Invalid airport input keeps the validation alert and does not navigate', async ({ page }) => {
  await page.goto('/?tab=flights')
  const airports = page.locator('input[role="combobox"]')
  await airports.nth(0).fill('Somewhere Unknown')
  await airports.nth(1).fill('Dubai (DXB)')
  const originalUrl = page.url()
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('recognised airport locations')
  await expect(page).toHaveURL(originalUrl)
})

test('Hotels cards use clean Trexifly partner copy and UTF-8 labels', async ({ page }) => {
  await page.goto('/results?type=hotels&to=Dubai&out=2026-12-15&back=2026-12-20&adults=2&children=0&rooms=1')
  await expect(page.getByText('Trexifly Partner Rates').first()).toBeVisible()
  await expect(page.getByText(/Compare live room rates — book directly with the official partner\./).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Search Agoda ↗' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Search Booking.com ↗' }).first()).toBeVisible()
  const hotelText = await page.locator('body').innerText()
  expect(hotelText).not.toMatch(/Sample listing|Sample score|simulated reviews|Partner link verification|Illustrative rating|Provider details may differ/i)
  expect(hotelText).not.toMatch(/â†|Â·|â˜/)
})

test('Hotels partner cards remain readable in light and dark themes', async ({ page }) => {
  await page.goto('/results?type=hotels&to=Dubai&out=2026-12-15&back=2026-12-20')
  const card = page.locator('article').first()
  await expect(card).toBeVisible()
  await expect(card.getByText('Trexifly Partner Rates').first()).toBeVisible()
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await expect(card).toBeVisible()
  await expect(card.getByRole('link', { name: 'Search Agoda ↗' })).toBeVisible()
  await page.evaluate(() => document.documentElement.classList.remove('dark'))
  await expect(card).toBeVisible()
})
