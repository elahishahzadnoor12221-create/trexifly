import { expect, test } from '@playwright/test'

test('results keeps the global category navigation and hides the duplicate compact tabs', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.route('**/api/flights/search?*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, offers: [], flexibleOffers: [] }),
  }))
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-01&back=2026-12-05')
  await expect(page.getByRole('link', { name: /Flights/ }).first()).toBeVisible()
  await expect(page.getByRole('tablist', { name: 'Travel search type' })).toHaveCount(0)
})

test('homepage desktop flight search controls stay on one aligned row at desktop breakpoints', async ({ page }) => {
  await page.route('https://photon.komoot.io/**', route => route.abort())
  await page.route('https://nominatim.openstreetmap.org/**', route => route.abort())
  await page.goto('/?tab=flights#search-widget')

  const form = page.locator('#search-widget form')
  await expect(form.locator('[data-search-field="Trip type"]')).toBeVisible()
  const fields = ['Trip type', 'From', 'To', 'Departure / Return', 'Travellers', 'Search']
  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    await form.scrollIntoViewIfNeeded()
    const boxes = await Promise.all(fields.map(async field => form.locator(`[data-search-field="${field}"]`).boundingBox()))
    expect(boxes.every(Boolean), `All six controls must be present at ${width}px`).toBe(true)
    const positions = boxes as NonNullable<(typeof boxes)[number]>[]
    const firstY = positions[0].y
    for (const [index, box] of positions.entries()) {
      expect(Math.abs(box.y - firstY), `${fields[index]} must remain on the same row at ${width}px`).toBeLessThanOrEqual(8)
      if (index > 0) {
        expect(box.x, `${fields[index]} must follow the previous control`).toBeGreaterThanOrEqual(positions[index - 1].x + positions[index - 1].width - 1)
      }
    }
  }
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(form.locator('[data-search-field="Search"]')).toBeVisible()
    const dimensions = await form.evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }))
    expect(dimensions.scrollWidth, `Search form must not overflow at ${width}px`).toBeLessThanOrEqual(dimensions.clientWidth + 1)
  }
})

test('flexible flight calendar keeps dates, long notices and CTA inside its white card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.route('**/api/flights/search?*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, offers: [], flexibleOffers: [] }),
  }))
  await page.route('**/api/flights/calendar**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      ok: true,
      prices: [],
      message: 'No cached partner fares are currently available for this month. Check another month or continue to the booking partner to verify current schedules, fares, baggage and availability.',
    }),
  }))
  await page.goto('/results?type=flights&from=Lahore%20(LHE)&to=Dubai%20(DXB)&out=2026-12-01&back=2026-12-05')
  await page.getByRole('button', { name: /2026-12-01|Choose departure date/ }).click()

  const calendar = page.getByRole('dialog', { name: 'Flight price calendar' })
  const notice = calendar.getByRole('status')
  const cta = calendar.getByRole('button', { name: /Select for round-trip/ })
  const lastDay = calendar.getByRole('button', { name: /2026-12-31/ })
  await expect(notice).toContainText('No cached partner fares')
  await expect(lastDay).toBeVisible()
  await expect(cta).toBeEnabled()

  const card = await calendar.boundingBox()
  const button = await cta.boundingBox()
  const day = await lastDay.boundingBox()
  expect(card).not.toBeNull()
  expect(button).not.toBeNull()
  expect(day).not.toBeNull()
  expect(button!.y + button!.height).toBeLessThanOrEqual(card!.y + card!.height + 1)
  expect(day!.x).toBeGreaterThanOrEqual(card!.x)
  expect(day!.x + day!.width).toBeLessThanOrEqual(card!.x + card!.width + 1)
  const dimensions = await calendar.evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
  expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight + 1)
})
