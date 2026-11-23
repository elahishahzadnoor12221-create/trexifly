import { test, expect } from '@playwright/test'

test('unified two-month calendar selects departure and return, toggles trip type, and loads rolling prices', async ({ page }) => {
  const requests: Array<{ month: string; oneWay: string | null }> = []
  await page.route('**/api/flights/search?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, offers: [], flexibleOffers: [] }) }))
  await page.route('**/api/flights/calendar**', async route => {
    const url = new URL(route.request().url())
    const month = url.searchParams.get('month') ?? ''
    const oneWay = url.searchParams.get('one_way')
    requests.push({ month, oneWay })
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
  await expect(page.getByRole('tablist', { name: 'Travel search type' })).toHaveCount(0)
  await page.getByRole('button', { name: /2026-12-01|Choose departure date/ }).click()
  const calendar = page.getByRole('dialog', { name: 'Flight price calendar' })
  await expect(calendar.getByRole('heading', { name: 'December 2026' })).toBeVisible()
  await expect(calendar.getByRole('heading', { name: 'January 2027' })).toBeVisible()
  await expect(calendar.getByRole('button', { name: /2026-12-08/ })).toBeVisible()
  await expect.poll(() => requests.some(request => request.month === '2026-12' && request.oneWay === 'false')).toBeTruthy()

  await calendar.getByRole('button', { name: /2026-12-08/ }).click()
  await expect(calendar.getByText('2. Choose return date (dates before departure are disabled)')).toBeVisible()
  await expect(calendar.getByRole('button', { name: /2026-12-07/ })).toBeDisabled()
  await calendar.getByRole('button', { name: /2026-12-10/ }).click()
  await expect(calendar.getByRole('button', { name: 'Select for round-trip — from $99' })).toBeEnabled()
  await calendar.getByRole('button', { name: 'Select for round-trip — from $99' }).click()
  await expect(page.getByRole('button', { name: /2026-12-10/ })).toBeVisible()

  await page.getByRole('button', { name: /2026-12-08/ }).click()
  const reopened = page.getByRole('dialog', { name: 'Flight price calendar' })
  await reopened.getByRole('group', { name: 'Calendar trip type' }).getByRole('button', { name: 'One-way' }).click()
  await expect(reopened.getByRole('button', { name: 'Select for one-way trip — from $99' })).toBeEnabled()
  await expect.poll(() => requests.some(request => request.month === '2026-12' && request.oneWay === 'true')).toBeTruthy()
  await reopened.getByRole('button', { name: 'Select for one-way trip — from $99' }).click()

  await page.getByRole('button', { name: /2026-12-08/ }).click()
  const calendarAgain = page.getByRole('dialog', { name: 'Flight price calendar' })
  await calendarAgain.getByLabel('Calendar year').selectOption('2027')
  await expect(calendarAgain.getByRole('heading', { name: 'January 2027' })).toBeVisible()
  await expect(calendarAgain.getByRole('heading', { name: 'February 2027' })).toBeVisible()
  const octoberRequest = page.waitForRequest(request => request.url().includes('month=2027-10'))
  await calendarAgain.getByLabel('Calendar month').selectOption('8')
  await octoberRequest
  await expect(calendarAgain.getByRole('heading', { name: 'September 2027' })).toBeVisible()
  await expect(calendarAgain.getByRole('heading', { name: 'October 2027' })).toBeVisible()
  await expect(calendarAgain.getByRole('button', { name: /2027-10-05/ })).toBeVisible()
  await expect(calendarAgain.getByRole('button', { name: 'Next month' })).toBeDisabled()
  expect(requests.some(request => request.month === '2027-10')).toBeTruthy()
})
