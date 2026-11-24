import { test, expect } from '@playwright/test'

function localDateOffset(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

test('Hotels block past check-in dates with the native date constraint', async ({ page }) => {
  await page.goto('/?tab=hotels#search-widget')
  const checkIn = page.getByLabel('Check-in')
  await expect(checkIn).toHaveAttribute('min', localDateOffset(0))
  await checkIn.fill('2020-01-01')
  expect(await checkIn.evaluate(input => (input as HTMLInputElement).validity.rangeUnderflow)).toBe(true)
  expect(await page.locator('#search-widget form').evaluate(form => (form as HTMLFormElement).checkValidity())).toBe(false)
  expect(new URL(page.url()).pathname).toBe('/')
})

test('Hotels require check-out strictly after check-in', async ({ page }) => {
  await page.goto('/?tab=hotels#search-widget')
  const checkIn = localDateOffset(10)
  await page.getByLabel('Check-in').fill(checkIn)
  const checkOut = page.getByLabel('Check-out')
  await checkOut.fill(checkIn)
  await expect(checkOut).toHaveAttribute('min', localDateOffset(11))
  expect(await checkOut.evaluate(input => (input as HTMLInputElement).validity.rangeUnderflow)).toBe(true)
  expect(await page.locator('#search-widget form').evaluate(form => (form as HTMLFormElement).checkValidity())).toBe(false)
  expect(new URL(page.url()).pathname).toBe('/')
})

test('Flights require return strictly after departure', async ({ page }) => {
  await page.route('**/api/flights/search?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, offers: [], flexibleOffers: [] }) }))
  await page.route('**/api/flights/calendar?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, prices: [] }) }))
  const sameDay = localDateOffset(10)
  await page.goto(`/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=${sameDay}&back=${sameDay}&adults=2&children=0&infants=0&pax=Economy`)
  await page.locator('#search-widget form button[data-search-field="Search"]').click()
  await expect(page.getByRole('alert')).toContainText('Return date must be after the departure date')
  expect(new URL(page.url()).searchParams.get('back')).toBe(sameDay)
})
