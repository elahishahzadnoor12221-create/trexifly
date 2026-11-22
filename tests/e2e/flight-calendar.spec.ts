import { test, expect } from '@playwright/test'

test('rolling two-month flight calendar loads daily prices through the final month and updates the CTA', async ({ page }) => {
  const requestedMonths: string[] = []
  await page.route('**/api/flights/search?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, offers: [], flexibleOffers: [] }) }))
  await page.route('**/api/flights/calendar?*', async route => {
    const url = new URL(route.request().url())
    const month = url.searchParams.get('month') ?? ''
    requestedMonths.push(month)
    const prices = month === '2026-12'
      ? [{ date: '2026-12-03', price: 120, currency: 'USD' }, { date: '2026-12-08', price: 99, currency: 'USD' }]
      : month === '2027-01'
        ? [{ date: '2027-01-05', price: 145, currency: 'USD' }]
        : month === '2027-10'
          ? [{ date: '2027-10-05', price: 175, currency: 'USD' }]
          : []
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, month, prices, markerId: '806576' }) })
  })
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-01&back=2026-12-05')
  await page.getByRole('tab', { name: 'Flights' }).click()
  await page.getByRole('button', { name: /2026-12-01|Choose departure date/ }).click()
  const calendar = page.getByRole('dialog', { name: 'Flight price calendar' })
  await expect(calendar.getByRole('heading', { name: 'December 2026' })).toBeVisible()
  await expect(calendar.getByRole('heading', { name: 'January 2027' })).toBeVisible()
  await expect(calendar.getByRole('button', { name: /2026-12-08, \$99/ })).toBeVisible()
  await calendar.getByRole('button', { name: /2026-12-08, \$99/ }).click()
  await expect(calendar.getByRole('button', { name: 'Select for round-trip — from $99' })).toBeVisible()
  await calendar.getByRole('button', { name: 'Select for round-trip — from $99' }).click()
  await expect(page.getByRole('button', { name: /2026-12-08/ })).toBeVisible()
  await page.getByRole('button', { name: /2026-12-08/ }).click()
  await calendar.getByLabel('Calendar year').selectOption('2027')
  await expect(calendar.getByRole('heading', { name: 'January 2027' })).toBeVisible()
  await expect(calendar.getByRole('heading', { name: 'February 2027' })).toBeVisible()
  const octoberRequest = page.waitForRequest(request => request.url().includes('month=2027-10'))
  await calendar.getByLabel('Calendar month').selectOption('8')
  await octoberRequest
  await expect(calendar.getByRole('heading', { name: 'September 2027' })).toBeVisible()
  await expect(calendar.getByRole('heading', { name: 'October 2027' })).toBeVisible()
  await expect(calendar.getByRole('button', { name: /2027-10-05, \$175/ })).toBeVisible()
  await expect(calendar.getByRole('button', { name: 'Next month' })).toBeDisabled()
  expect(requestedMonths).toContain('2027-10')
})
