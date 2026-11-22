import { test, expect } from '@playwright/test'

test('round-trip flight search stays on Results and offers Aviasales plus the Travelpayouts link', async ({ page }) => {
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-15&back=2026-12-20&adults=3&children=2&infants=1&cabin=Business&tripType=round-trip&tpwl=1')
  await expect(page).toHaveURL(/\/results\?/)
  const aviasales = page.getByRole('link', { name: /Search Live Flights on Aviasales/ })
  await expect(aviasales).toBeVisible()
  expect(await aviasales.getAttribute('href')).toBe('https://www.aviasales.com/search/LHE1512DXB2012c32?marker=806576')
  const whiteLabel = page.getByRole('link', { name: /Also try flights\.trexifly\.com/ })
  await expect(whiteLabel).toBeVisible()
  expect(await whiteLabel.getAttribute('href')).toBe('https://flights.trexifly.com/?flightSearch=LHE1512DXB2012c321&marker=806576')
})

test('one-way fallback preserves first class, infant count and affiliate marker', async ({ page }) => {
  await page.goto('/results?type=flights&from=Islamabad%20(ISB)&to=Dubai%20(DXB)&out=2026-12-22&back=2026-12-22&adults=2&children=0&infants=1&cabin=First%20Class&tripType=one-way&tpwl=1')
  await expect(page).toHaveURL(/\/results\?/)
  const aviasales = page.getByRole('link', { name: /Search Live Flights on Aviasales/ })
  await expect(aviasales).toBeVisible()
  expect(await aviasales.getAttribute('href')).toBe('https://www.aviasales.com/search/ISB2212DXBf2?marker=806576')
  const whiteLabel = page.getByRole('link', { name: /Also try flights\.trexifly\.com/ })
  await expect(whiteLabel).toBeVisible()
  expect(await whiteLabel.getAttribute('href')).toBe('https://flights.trexifly.com/?flightSearch=ISB2212DXBf201&marker=806576')
})

test('White Label fallback rejects an unrecognised airport instead of dropping route data', async ({ page }) => {
  await page.goto('/results?type=flights&from=Somewhere%20Unknown&to=Dubai%20(DXB)&out=2026-12-22&back=2026-12-22&adults=2&tpwl=1')
  await expect(page.getByRole('alert')).toContainText('valid airport IATA codes')
  await expect(page).toHaveURL(/\/results\?/)
})
