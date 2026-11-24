import { test, expect } from '@playwright/test'

const staysUrl = '/results?type=hotels&to=London%2C%20United%20Kingdom&out=2026-12-10&back=2026-12-14&adults=2&children=1&rooms=2&childAges=7&pax=2%20adults%20%2F%201%20child%20%2F%202%20rooms'

test('Hotel results provide all configured partner handoffs without fabricating listings', async ({ page }) => {
  await page.goto(staysUrl)
  await expect(page.getByRole('heading', { name: 'Stays in London, United Kingdom' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Compare hotel booking partners' })).toBeVisible()
  const tripLink = page.getByRole('link', { name: 'Search hotels on Trip.com' })
  const tripUrl = new URL(await tripLink.getAttribute('href') ?? '', page.url())
  expect(tripUrl.pathname).toBe('/api/affiliates/link')
  expect(tripUrl.searchParams.get('to')).toBe('London, United Kingdom')
  expect(tripUrl.searchParams.get('out')).toBe('2026-12-10')
  expect(tripUrl.searchParams.get('back')).toBe('2026-12-14')
  expect(tripUrl.searchParams.get('adults')).toBe('2')
  expect(tripUrl.searchParams.get('children')).toBe('1')
  expect(tripUrl.searchParams.get('childAges')).toBe('7')
  expect(tripUrl.searchParams.get('rooms')).toBe('2')
  await expect(tripLink).toHaveAttribute('target', '_blank')
  await expect(tripLink).toHaveAttribute('rel', /sponsored/)
  await expect(tripLink).toHaveAttribute('data-affiliate-status', 'dynamic')
  await expect(page.getByRole('link', { name: /Search hotels on Klook|Search hotels on KKday/ })).toHaveCount(0)
  await expect(page.getByText(/does not display live hotel inventory/i)).toBeVisible()
  await expect(page.locator('.hotel-provider-link')).toHaveCount(0)
  await expect(page.getByText('Partner rate guide')).toHaveCount(0)
  await expect(page.locator('a[href*="agoda.com"], a[href*="booking.com"], a[href*="expedia.com"]')).toHaveCount(0)
})

test('Stays search form submits a global destination and selected dates', async ({ page }) => {
  await page.goto('/?tab=hotels#search-widget')
  await page.getByRole('combobox').first().fill('Dublin, Ireland')
  await page.getByLabel('Check-in').fill('2026-12-10')
  await page.getByLabel('Check-out').fill('2026-12-13')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page).toHaveURL(/\/results\?/)
  await expect(page.getByRole('heading', { name: 'Stays in Dublin, Ireland' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Compare hotel booking partners' })).toBeVisible()
  await expect(page.locator('.hotel-provider-link')).toHaveCount(0)
})

test('Stays results support Light and Dark themes without showing sample inventory', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('trexifly.theme', 'light'))
  await page.goto(staysUrl)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByRole('heading', { name: 'Compare hotel booking partners' })).toBeVisible()
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.hotel-provider-link')).toHaveCount(0)
  await page.getByRole('button', { name: 'Switch to light mode' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('five original stays destination guides are reachable and SEO titled', async ({ page }) => {
  const routes = [
    '/guides/stays-dubai-makkah',
    '/guides/stays-london-europe',
    '/guides/stays-new-york-toronto',
    '/guides/stays-sydney-auckland',
    '/guides/stays-northern-pakistan',
  ]
  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page).toHaveTitle(/\| Trexifly$/)
    await expect(page.getByRole('link', { name: 'Search Stays' })).toBeVisible()
  }
})
