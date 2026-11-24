import { expect, test } from '@playwright/test'

const sampleReport = {
  from: '2026-10-01',
  to: '2026-11-24',
  currency: 'USD',
  rows: [
    { id: 'tiqets', campaignId: 89, name: 'Tiqets', category: 'Tours', redirects: 120, searches: 40, paidBookings: 5, processingBookings: 2, cancelledBookings: 1, paidProfitUsd: 35.5, processingProfitUsd: 12 },
    { id: 'autoeurope', campaignId: 143, name: 'AutoEurope (EU/UK)', category: 'Cars', redirects: 90, searches: 20, paidBookings: 3, processingBookings: 1, cancelledBookings: 0, paidProfitUsd: 52, processingProfitUsd: 8 },
  ],
  totals: { redirects: 210, searches: 60, paidBookings: 8, processingBookings: 3, cancelledBookings: 1, paidProfitUsd: 87.5, processingProfitUsd: 20 },
}

test('affiliate performance dashboard reuses existing admin session and displays aggregated provider metrics', async ({ page }) => {
  await page.route('**/api/alerts/auth', route => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true }),
  }))
  await page.route('**/api/alerts/affiliates?**', route => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify(sampleReport),
  }))

  await page.goto('/admin/affiliates')
  await expect(page.getByRole('heading', { name: 'Affiliate performance' })).toBeVisible()
  await expect(page.getByText('210', { exact: true })).toBeVisible()
  await expect(page.getByText('$87.50', { exact: true })).toBeVisible()
  await expect(page.getByRole('row', { name: /Tiqets Tours 120 40 5 2 1/ })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Alerts & B2B' })).toHaveAttribute('href', '/admin/alerts')
})

test('affiliate performance dashboard requires the existing admin login', async ({ page }) => {
  await page.route('**/api/alerts/auth', route => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: false }),
  }))
  await page.goto('/admin/affiliates')
  await expect(page.getByRole('heading', { name: 'Affiliate performance' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open secure admin login' })).toHaveAttribute('href', '/admin/alerts')
})
