import { test, expect } from '@playwright/test'

const staysUrl = '/results?type=hotels&to=London%2C%20United%20Kingdom&out=2026-12-10&back=2026-12-14&adults=2&children=1&rooms=2&childAges=7&pax=2%20adults%20%2F%201%20child%20%2F%202%20rooms'

test('Stays results show four destination-prefilled brand comparisons with marker 806576', async ({ page }) => {
  await page.goto(staysUrl)
  await expect(page.getByRole('heading', { name: 'Stays in London, United Kingdom' })).toBeVisible()
  const card = page.locator('article').first()
  const providers = [
    { id: 'agoda', name: 'Search Agoda', keys: { city: 'London, United Kingdom', checkIn: '2026-12-10', checkOut: '2026-12-14', adults: '2', children: '1', rooms: '2' } },
    { id: 'booking', name: 'Search Booking.com', keys: { ss: 'London, United Kingdom', checkin: '2026-12-10', checkout: '2026-12-14', group_adults: '2', group_children: '1', no_rooms: '2', age: '7' } },
    { id: 'expedia', name: 'Search Expedia / Hotels.com', keys: { destination: 'London, United Kingdom', startDate: '2026-12-10', endDate: '2026-12-14', adults: '2', children: '1', rooms: '2', childAge: '7' } },
    { id: 'trip', name: 'Search Trip.com', keys: { city: 'London, United Kingdom', checkin: '2026-12-10', checkout: '2026-12-14', adult: '2', children: '1', crn: '2', childages: '7' } },
  ]
  for (const provider of providers) {
    const link = card.locator(`a[data-provider-id="${provider.id}"]`)
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('data-affiliate-status', 'unverified')
    const href = await link.getAttribute('href')
    expect(href).toBeTruthy()
    const url = new URL(href!)
    expect(url.searchParams.get('marker')).toBe('806576')
    for (const [key, value] of Object.entries(provider.keys)) expect(url.searchParams.get(key)).toBe(value)
  }
  await expect(page.getByText('Illustrative guide price only').first()).toBeVisible()
})

test('Stays search form submits a global destination and selected dates', async ({ page }) => {
  await page.goto('/?tab=hotels#search-widget')
  await page.getByRole('combobox').first().fill('Dublin, Ireland')
  await page.getByLabel('Check-in').fill('2026-12-10')
  await page.getByLabel('Check-out').fill('2026-12-13')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page).toHaveURL(/\/results\?/)
  await expect(page.getByRole('heading', { name: 'Stays in Dublin, Ireland' })).toBeVisible()
  await expect(page.locator('a[data-provider-id="agoda"]').first()).toBeVisible()
})

test('Stays results support Light and Dark themes', async ({ page }) => {
  await page.goto(staysUrl)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('button', { name: 'Switch to dark mode' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
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
