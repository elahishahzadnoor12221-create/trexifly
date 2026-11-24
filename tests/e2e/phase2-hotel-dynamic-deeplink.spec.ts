import { test, expect } from '@playwright/test'

test('Hotels send the complete selected stay search through the Trip.com affiliate redirect', async ({ page }) => {
  await page.goto('/results?type=hotels&to=Tokyo&out=2026-12-10&back=2026-12-14&adults=2&children=2&childAges=5%2C8&rooms=2&pax=2%20adults')
  const link = page.getByRole('link', { name: 'Search hotels on Trip.com' })
  await expect(link).toBeVisible()
  const href = new URL(await link.getAttribute('href') ?? '', page.url())
  expect(href.pathname).toBe('/api/affiliates/link')
  expect(href.searchParams.get('id')).toBe('trip')
  expect(href.searchParams.get('to')).toBe('Tokyo')
  expect(href.searchParams.get('out')).toBe('2026-12-10')
  expect(href.searchParams.get('back')).toBe('2026-12-14')
  expect(href.searchParams.get('adults')).toBe('2')
  expect(href.searchParams.get('children')).toBe('2')
  expect(href.searchParams.get('childAges')).toBe('5,8')
  expect(href.searchParams.get('rooms')).toBe('2')
  await expect(link).toHaveAttribute('data-affiliate-status', 'dynamic')
})

test('Hotel handoff exposes only the configured dynamic Trip.com provider', async ({ page }) => {
  await page.goto('/results?type=hotels&to=Dubai&out=2026-12-10&back=2026-12-14&adults=1&children=0&rooms=1')
  await expect(page.getByRole('link', { name: 'Search hotels on Trip.com' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Search hotels on Klook|Search hotels on KKday/ })).toHaveCount(0)
})
