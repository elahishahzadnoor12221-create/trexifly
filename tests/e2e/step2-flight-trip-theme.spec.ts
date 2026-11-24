import { expect, test } from '@playwright/test'

for (const dark of [false, true]) {
  test(`Trip Type dropdown is readable and unclipped in ${dark ? 'Dark' : 'Light'} Mode`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route('https://tpembars.com/**', route => route.abort())
    await page.route('https://open.er-api.com/**', route => route.abort())
    await page.route('https://photon.komoot.io/**', route => route.abort())
    await page.route('https://nominatim.openstreetmap.org/**', route => route.abort())
    await page.goto('/?tab=flights', { waitUntil: 'domcontentloaded' })
    const themeToggle = page.getByRole('button', { name: /Switch to (dark|light) mode/ })
    const isDark = (await themeToggle.getAttribute('aria-pressed')) === 'true'
    if (isDark !== dark) await themeToggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light')
    await expect(page.locator('#search-widget')).toBeVisible()

    const trip = page.locator('#search-widget select').filter({ has: page.locator('option', { hasText: 'Round-trip' }) }).first()
    await expect(trip).toBeVisible()
    await expect(trip).toHaveValue('Round-trip')
    const metrics = await trip.evaluate(el => {
      const label = el.closest('label')!
      const option = el.querySelector('option:checked')!
      return {
        text: option.textContent?.trim(),
        color: getComputedStyle(el).color,
        width: el.getBoundingClientRect().width,
        containerWidth: label.getBoundingClientRect().width,
        minWidth: getComputedStyle(el).minWidth,
      }
    })
    expect(metrics.text).toBe('Round-trip')
    expect(metrics.color).toBe(dark ? 'rgb(255, 255, 255)' : 'rgb(15, 23, 42)')
    expect(metrics.containerWidth).toBeGreaterThanOrEqual(174)
    expect(metrics.width).toBeGreaterThanOrEqual(132)
    expect(metrics.width).toBeLessThanOrEqual(metrics.containerWidth - 12)
    await trip.selectOption('One-way')
    await expect(trip).toHaveValue('One-way')
    await trip.selectOption('Round-trip')
    await expect(trip).toHaveValue('Round-trip')
  })
}

test('Hotel results show verified Klook and KKday handoffs and disclose that live inventory is not displayed', async ({ page }) => {
  await page.goto('/results?type=hotels&to=Dubai%2C%20United%20Arab%20Emirates&out=2026-12-10&back=2026-12-14')
  await expect(page.locator('.hotel-provider-link')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Compare hotel booking partners' })).toBeVisible()
  const klookLink = page.getByRole('link', { name: /Search hotels on Klook/ })
  await expect(klookLink).toBeVisible()
  await expect(klookLink).toHaveAttribute('data-affiliate-status', 'verified')
  const kkdayLink = page.getByRole('link', { name: /Search hotels on KKday/ })
  await expect(kkdayLink).toBeVisible()
  await expect(kkdayLink).toHaveAttribute('href', 'https://kkday.tpx.lv/x5gqHfDJ')
  await expect(kkdayLink).toHaveAttribute('data-affiliate-status', 'verified')
  await expect(klookLink).toHaveAttribute('href', /klook\.tpx\.lv/)
  const disclosure = page.getByText(/does not display live hotel inventory or guarantee availability/i)
  await expect(disclosure).toBeVisible()
  for (const dark of [false, true]) {
    const toggle = page.getByRole('button', { name: /Switch to (dark|light) mode/ })
    const isDark = (await toggle.getAttribute('aria-pressed')) === 'true'
    if (isDark !== dark) await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light')
    await expect(page.getByRole('heading', { name: 'Compare hotel booking partners' })).toBeVisible()
    await expect(disclosure).toBeVisible()
  }
  const visible = await page.locator('body').innerText()
  expect(visible).not.toContain(String.fromCharCode(0x00c2, 0x00b7))
  expect(visible).not.toContain(String.fromCharCode(0x00e2, 0x2020, 0x2014))
  expect(visible).not.toContain(String.fromCharCode(0x00e2, 0x0153))
  expect(visible).toContain(String.fromCharCode(0x00b7))
})