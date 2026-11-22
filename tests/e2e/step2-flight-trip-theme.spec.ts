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


test('Stays comparison labels stay white and visible in Light and Dark Mode', async ({ page }) => {
  await page.goto('/results?type=hotels&to=Dubai%2C%20United%20Arab%20Emirates&out=2026-12-10&back=2026-12-14')
  const links = page.locator('.hotel-provider-link')
  expect(await links.count()).toBeGreaterThanOrEqual(4)
  const firstFour = (await links.all()).slice(0, 4)
  for (const dark of [false, true]) {
    const toggle = page.getByRole('button', { name: /Switch to (dark|light) mode/ })
    const isDark = (await toggle.getAttribute('aria-pressed')) === 'true'
    if (isDark !== dark) await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light')
    for (const link of firstFour) await expect(link).toHaveCSS('color', 'rgb(255, 255, 255)')
  }
  await expect(page.locator('article svg[aria-hidden="true"]').first()).toBeVisible()
  const visible = await page.locator('body').innerText()
  expect(visible).not.toContain(String.fromCharCode(0x00c2, 0x00b7))
  expect(visible).not.toContain(String.fromCharCode(0x00e2, 0x2020, 0x2014))
  expect(visible).not.toContain(String.fromCharCode(0x00e2, 0x0153))
  expect(visible).toContain(String.fromCharCode(0x00b7))
})
