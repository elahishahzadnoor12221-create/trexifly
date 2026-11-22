import { test, expect } from '@playwright/test'

test('round-trip White Label redirect preserves IATA, dates, business cabin, all passenger groups and marker', async ({ page }) => {
  let targetUrl = ''
  await page.route('https://flights.trexifly.com/**', async route => {
    targetUrl = route.request().url()
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Travelpayouts WL test</title>' })
  })

  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-15&back=2026-12-20&adults=3&children=2&infants=1&cabin=Business&tripType=round-trip&tpwl=1')
  await expect(page).toHaveURL('https://flights.trexifly.com/?flightSearch=LHE1512DXB2012c321&marker=806576')
  expect(new URL(targetUrl).searchParams.get('flightSearch')).toBe('LHE1512DXB2012c321')
  expect(new URL(targetUrl).searchParams.get('marker')).toBe('806576')
})

test('one-way White Label redirect preserves first class and infant passenger position', async ({ page }) => {
  let targetUrl = ''
  await page.route('https://flights.trexifly.com/**', async route => {
    targetUrl = route.request().url()
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Travelpayouts WL test</title>' })
  })

  await page.goto('/results?type=flights&from=Islamabad%20(ISB)&to=Dubai%20(DXB)&out=2026-12-22&back=2026-12-22&adults=2&children=0&infants=1&cabin=First%20Class&tripType=one-way&tpwl=1')
  await expect(page).toHaveURL('https://flights.trexifly.com/?flightSearch=ISB2212DXBf201&marker=806576')
  expect(new URL(targetUrl).searchParams.get('flightSearch')).toBe('ISB2212DXBf201')
})

test('White Label redirect rejects an unrecognised airport instead of dropping route data', async ({ page }) => {
  await page.goto('/results?type=flights&from=Somewhere%20Unknown&to=Dubai%20(DXB)&out=2026-12-22&back=2026-12-22&adults=2&tpwl=1')
  await expect(page.getByRole('alert')).toContainText('valid airport IATA codes')
  await expect(page).toHaveURL(/\/results\?/)
})
