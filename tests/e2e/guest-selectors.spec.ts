import { expect, test, type Page } from '@playwright/test'

async function blockExternalScripts(page: Page) {
  await page.route('https://tpembars.com/**', route => route.abort())
  await page.route('https://open.er-api.com/**', route => route.abort())
  await page.route('https://photon.komoot.io/**', route => route.abort())
  await page.route('https://nominatim.openstreetmap.org/**', route => route.abort())
}

test('Stays guest selectors support 5 adults, 5 children, 6 rooms and individual child ages', async ({ page }) => {
  await blockExternalScripts(page)
  await page.goto('/?tab=hotels', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /Choose passengers/ }).click()
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Add adult' }).click()
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Add child' }).click()
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Add room' }).click()
  for (let index = 1; index <= 5; index += 1) await page.getByLabel(`Child ${index} age`).selectOption(String(index + 3))
  await page.getByRole('button', { name: 'Done' }).click()
  await page.getByRole('button', { name: 'Search' }).first().click()
  await expect(page).toHaveURL(/\/results\?/, { timeout: 15000 })
  const url = new URL(page.url())
  expect(url.searchParams.get('adults')).toBe('5')
  expect(url.searchParams.get('children')).toBe('5')
  expect(url.searchParams.get('rooms')).toBe('6')
  expect(url.searchParams.get('childAges')).toBe('4,5,6,7,8')
})

test('Flights guest selectors support up to 5 adults and 5 children with cabin class in the same menu', async ({ page }) => {
  await blockExternalScripts(page)
  await page.goto('/?tab=flights', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /Choose passengers/ }).click()
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Add adult' }).click()
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Add child' }).click()
  await page.locator('select[aria-label="Cabin class"]').selectOption('Business')
  await page.locator('select[aria-label="Cabin class"]').selectOption('First Class')
  await page.getByRole('button', { name: 'Done' }).click()
  await page.getByRole('button', { name: 'Search' }).first().click()
  await expect(page).toHaveURL(/\/results\?/, { timeout: 15000 })
  const url = new URL(page.url())
  expect(url.searchParams.get('adults')).toBe('5')
  expect(url.searchParams.get('children')).toBe('5')
  expect(url.searchParams.get('cabin')).toBe('First Class')
})

test('Stays guest selectors remain usable on a mobile viewport', async ({ page }) => {
  await blockExternalScripts(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?tab=hotels', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /Choose passengers/ }).click()
  await expect(page.getByRole('button', { name: 'Add adult' })).toBeVisible()
  await page.getByRole('button', { name: 'Add child' }).click()
  await expect(page.getByLabel('Child 1 age')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add room' })).toBeVisible()
})
