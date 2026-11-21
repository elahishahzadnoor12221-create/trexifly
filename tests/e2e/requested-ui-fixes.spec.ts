import { expect, test, type Page } from '@playwright/test'

async function setTheme(page: Page, dark: boolean) {
  const toggle = page.getByRole('button', { name: /Switch to (dark|light) mode/ })
  const isDark = (await toggle.getAttribute('aria-pressed')) === 'true'
  if (isDark !== dark) await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light')
}

for (const dark of [false, true]) {
  test(`homepage dropdown, hero spacing and support buttons are clear in ${dark ? 'dark' : 'light'} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route('https://tpembars.com/**', route => route.abort())
    await page.route('https://open.er-api.com/**', route => route.abort())
    await page.route('https://photon.komoot.io/**', route => route.abort())
    await page.route('https://nominatim.openstreetmap.org/**', route => route.abort())
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await setTheme(page, dark)

    const hero = page.locator('.trexifly-home-hero')
    const heroStyle = await hero.evaluate(el => {
      const s = getComputedStyle(el)
      return { overflow: s.overflow, zIndex: s.zIndex, paddingTop: parseFloat(s.paddingTop), paddingBottom: parseFloat(s.paddingBottom) }
    })
    expect(heroStyle.overflow).toBe('visible')
    expect(Number(heroStyle.zIndex)).toBeGreaterThan(0)
    expect(heroStyle.paddingTop).toBeLessThanOrEqual(28)
    expect(heroStyle.paddingBottom).toBeLessThanOrEqual(28)

    const guestToggle = page.getByRole('button', { name: /Choose passengers/ })
    await guestToggle.click()
    const menu = page.locator('.trexifly-guest-menu')
    await expect(menu).toBeVisible()
    await expect(menu.getByText('Rooms', { exact: true })).toBeVisible()
    const done = menu.getByRole('button', { name: 'Done' })
    await expect(done).toBeVisible()
    const hitTest = await done.evaluate(el => {
      const r = el.getBoundingClientRect()
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return !!hit && (hit === el || el.contains(hit))
    })
    expect(hitTest, 'Done button must not be covered by the section below').toBe(true)
    const summary = await guestToggle.innerText()
    expect(summary).toContain('2 Adults, 0 Children \u2022 1 Room')
    await done.click()

    const wa = page.getByRole('link', { name: 'Chat with Trexifly on WhatsApp' }).last().last()
    const ai = page.getByRole('button', { name: 'Open AI travel assistant' })
    await expect(wa).toBeVisible()
    await expect(ai).toBeVisible()
    const separated = await Promise.all([wa.boundingBox(), ai.boundingBox()])
    expect(separated[0]).not.toBeNull()
    expect(separated[1]).not.toBeNull()
    const a = separated[0]!
    const b = separated[1]!
    const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
    const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
    expect(overlapX * overlapY, 'WhatsApp and AI controls must never overlap').toBe(0)

    await expect(page.getByText(/Worldwide address suggestions · OpenStreetMap contributors ·/)).toBeVisible()
    const visibleText = await page.locator('body').innerText()
    expect(visibleText).not.toContain('\uFFFD')
    expect(visibleText).not.toContain('T?rkiye')
    expect(visibleText).not.toContain('M?venpick')
  })
}

test('homepage floating support controls remain separated on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route('https://tpembars.com/**', route => route.abort())
  await page.route('https://open.er-api.com/**', route => route.abort())
  await page.route('https://photon.komoot.io/**', route => route.abort())
  await page.route('https://nominatim.openstreetmap.org/**', route => route.abort())
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const wa = page.getByRole('link', { name: 'Chat with Trexifly on WhatsApp' }).last()
  const ai = page.getByRole('button', { name: 'Open AI travel assistant' })
  await expect(wa).toBeVisible()
  await expect(ai).toBeVisible()
  const [a, b] = await Promise.all([wa.boundingBox(), ai.boundingBox()])
  expect(a).not.toBeNull()
  expect(b).not.toBeNull()
  expect(a!.x + a!.width).toBeLessThan(b!.x)
})
