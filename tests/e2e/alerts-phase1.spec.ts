import { expect, test } from '@playwright/test'

test('Phase 1 public subscription card supports B2C/B2B and explicit channel consent', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('#smart-travel-alerts')
  await expect(card.getByRole('heading', { name: 'Get Smart AI Travel & Partner Alerts' })).toBeVisible()
  await expect(card.getByRole('button', { name: 'Subscribe to Trexifly Alerts' })).toBeDisabled()
  await card.getByRole('button', { name: 'Travel Agent / B2B' }).click()
  await expect(card.getByLabel('Agency Name')).toBeVisible()
  await card.getByLabel('I agree to receive relevant Trexifly marketing and travel updates by email. I can unsubscribe at any time.').check()
  await expect(card.getByRole('button', { name: 'Subscribe to Trexifly Alerts' })).toBeEnabled()
  await card.getByLabel('I agree to receive relevant Trexifly updates on WhatsApp. I can withdraw this consent at any time.').check()
  await expect(card.getByLabel('Preferred Language')).toHaveValue(/^(en|ur|ar)$/)
})

test('Phase 1 Admin Alerts route shows a password gate', async ({ page }) => {
  await page.goto('/admin/alerts')
  await expect(page.getByRole('heading', { name: 'Alerts & B2B Outreach' })).toBeVisible()
  await expect(page.getByPlaceholder('Admin password')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Secure Admin Login' })).toBeVisible()
})
