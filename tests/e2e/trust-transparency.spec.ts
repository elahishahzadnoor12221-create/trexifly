import { expect, test } from '@playwright/test'

test('new visitors see the dark theme and clearly labelled sample vehicle data', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByText('Example', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('note')).toContainText(/Every vehicle image, model, supplier label.*illustrative only/i)
  await expect(page.getByRole('note')).toContainText(/These are not live quotes, partner-confirmed offers/i)
  await expect(page.getByRole('heading', { name: 'Explore Travel Partner Services' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Explore provider options' })).toHaveCount(0)
  const carSection = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Top Car Rental Destinations' }) }).first()
  await expect(carSection).toHaveCSS('background-color', 'rgb(2, 6, 23)')
})

test('account panel does not collect credentials while account service is unavailable', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('banner').getByRole('button', { name: 'Account', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Account access is not available yet')
  await expect(dialog).toContainText('Sign-in and registration are not connected yet')
  await expect(dialog).toContainText('Do not enter a password here')
  await expect(dialog.locator('input[type="password"]')).toHaveCount(0)
  await expect(dialog.getByRole('link', { name: 'Open My Trips' })).toBeVisible()
})

test('language selector discloses that translation coverage is partial', async ({ page }) => {
  await page.goto('/')
  const currencyButton = page.locator('header').getByRole('button').filter({ hasText: 'USD' })
  await currencyButton.click()
  const dialog = page.getByRole('dialog', { name: 'Select your currency and language' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Only selected interface labels are translated. Some pages and partner content remain in English.')
})
