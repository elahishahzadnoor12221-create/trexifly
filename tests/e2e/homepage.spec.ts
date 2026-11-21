import { expect, test } from '@playwright/test'

test('TREXIFLY homepage responds and renders a document body', async ({ page }) => {
  await page.route('https://tpembars.com/**', route => route.abort())
  await page.route('https://open.er-api.com/**', route => route.abort())
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' })
  expect(response, 'Homepage should return an HTTP response').not.toBeNull()
  expect(response!.status(), 'Homepage should not return an HTTP error').toBeLessThan(400)
  await expect(page.getByRole('heading', { name: /Where to next/ })).toBeVisible()
})
