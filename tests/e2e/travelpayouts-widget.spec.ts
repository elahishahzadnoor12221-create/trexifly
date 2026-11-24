import { expect, test } from '@playwright/test'

test('Homepage Flights shows one Trexifly native search and does not mount the duplicate White Label widget', async ({ page }) => {
  await page.route('https://tpwdg.com/**', route => route.abort())
  await page.route('https://tpembars.com/**', route => route.abort())
  await page.goto('/?tab=flights', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('#search-widget > form')).toHaveCount(1)
  await expect(page.locator('#search-widget > form')).toBeVisible()
  await expect(page.locator('#tpwl-search, #tpwl-tickets')).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Travelpayouts flight search and results' })).toHaveCount(0)
  await expect(page.locator('head script#trexifly-travelpayouts-white-label')).toHaveCount(0)
})

test('Non-flight homepage tabs also do not load the White Label widget', async ({ page }) => {
  await page.route('https://tpwdg.com/**', route => route.abort())
  await page.goto('/?tab=hotels', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('#tpwl-search, #tpwl-tickets')).toHaveCount(0)
  await expect(page.locator('head script#trexifly-travelpayouts-white-label')).toHaveCount(0)
})