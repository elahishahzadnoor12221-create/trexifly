import { test, expect } from '@playwright/test'

test('round-trip direct Results shows only the branded Trexifly flight CTA', async ({ page }) => {
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-15&back=2026-12-20&adults=3&children=2&infants=1&cabin=Business&tripType=round-trip')
  await expect(page.getByRole('heading', { name: 'Your selected journey' })).toBeVisible()
  await expect(page.getByText('Lahore (LHE) to Dubai (DXB)')).toBeVisible()
  await expect(page.getByText('3 Adults, 2 Children, 1 Infant')).toBeVisible()
  const liveFlights = page.getByRole('link', { name: 'View Live Trexifly Flights' })
  await expect(liveFlights).toBeVisible()
  expect(await liveFlights.getAttribute('href')).toBe('https://flights.trexifly.com/?flightSearch=LHE1512DXB2012c321&marker=806576')
  expect(await liveFlights.getAttribute('target')).toBeNull()
  await expect(page.getByRole('link', { name: /Aviasales/i })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Continue to/i })).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Official booking partners' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'View Live Trexifly Flights' })).toHaveCount(1)
})

test('one-way First Class journey preserves infant count and uses the Trexifly domain', async ({ page }) => {
  await page.goto('/results?type=flights&from=Islamabad%20(ISB)&to=Dubai%20(DXB)&out=2026-12-22&back=2026-12-22&adults=2&children=0&infants=1&cabin=First%20Class&tripType=one-way')
  const liveFlights = page.getByRole('link', { name: 'View Live Trexifly Flights' })
  await expect(liveFlights).toBeVisible()
  expect(await liveFlights.getAttribute('href')).toBe('https://flights.trexifly.com/?flightSearch=ISB2212DXBf201&marker=806576')
  expect(await liveFlights.getAttribute('target')).toBeNull()
  await expect(page.getByRole('link', { name: /Aviasales/i })).toHaveCount(0)
})

test('valid homepage Flights search navigates in the same tab to Trexifly Live Flights', async ({ page }) => {
  await page.route('https://flights.trexifly.com/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Trexifly Live Flights Test</title>' }))
  await page.goto('/?tab=flights')
  const initialPage = page
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect.poll(() => initialPage.url()).toMatch(/^https:\/\/flights\.trexifly\.com\/\?flightSearch=LHE\d{4}DXB\d{4}2&marker=806576$/)
  await expect(page).toHaveTitle('Trexifly Live Flights Test')
})

test('invalid airport entry keeps the validation alert and does not redirect', async ({ page }) => {
  await page.goto('/?tab=flights')
  const airports = page.locator('input[role="combobox"]')
  await airports.nth(0).fill('Somewhere Unknown')
  await airports.nth(1).fill('Dubai (DXB)')
  const originalUrl = page.url()
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('recognised airport locations')
  await expect(page).toHaveURL(originalUrl)
})
