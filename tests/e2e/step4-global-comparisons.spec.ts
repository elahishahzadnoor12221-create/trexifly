import { expect, test } from '@playwright/test'

const markerLinks = (page: import('@playwright/test').Page) => page.locator('a[data-affiliate-marker="806576"]')

test('global car comparison preserves 30 examples and prefills all three partner searches', async ({ page }) => {
  await page.goto('/results?type=cars&from=Heathrow%20Airport%2C%20London&to=Central%20London&out=2026-12-10&back=2026-12-14&pickupTime=09%3A30&dropTime=11%3A00&driverAge=35')
  await expect(page.getByRole('heading', { name: '30 options to compare' })).toBeVisible()
  const links = markerLinks(page)
  await expect(links).toHaveCount(90)
  const urls = await links.evaluateAll(nodes => nodes.slice(0, 3).map(node => (node as HTMLAnchorElement).href))
  for (const href of urls) {
    const url = new URL(href)
    expect(url.searchParams.get('marker')).toBe('806576')
  }
  const discover = new URL(urls[0])
  expect(discover.searchParams.get('pick_up_location')).toContain('Heathrow')
  expect(discover.searchParams.get('pick_up_date')).toBe('2026-12-10')
  expect(discover.searchParams.get('drop_off_date')).toBe('2026-12-14')
  expect(discover.searchParams.get('driver_age')).toBe('35')
  const toggle = page.getByRole('button', { name: /Switch to (dark|light) mode/ })
  for (const dark of [false, true]) {
    const isDark = (await toggle.getAttribute('aria-pressed')) === 'true'
    if (isDark !== dark) await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light')
    await expect(links.first()).toHaveCSS('color', 'rgb(255, 255, 255)')
  }
})

test('global airport transfer comparison preserves 20 examples and passes passenger/luggage counts', async ({ page }) => {
  await page.goto('/results?type=transfers&service=airport-transfer&from=Dubai%20International%20Airport&to=Dubai%20Marina&out=2026-12-10&back=2026-12-12&pickupTime=08%3A15&passengers=3&luggage=4')
  await expect(page.getByRole('heading', { name: '20 options to compare' })).toBeVisible()
  const links = markerLinks(page)
  await expect(links).toHaveCount(60)
  const urls = await links.evaluateAll(nodes => nodes.slice(0, 3).map(node => (node as HTMLAnchorElement).href))
  for (const href of urls) {
    const url = new URL(href)
    expect(url.searchParams.get('marker')).toBe('806576')
    expect(url.searchParams.get('passengers')).toBe('3')
    expect(url.searchParams.get('luggage')).toBe('4')
  }
  const intui = new URL(urls[1])
  expect(intui.searchParams.get('arrivaldate')).toBe('2026-12-10')
  expect(intui.searchParams.get('arrivaltime')).toBe('08:15')
})

test('global activities hubs render destination cards with four marked comparison providers', async ({ page }) => {
  const hubs = [
    ['Dubai, United Arab Emirates', 'Burj Khalifa At The Top'],
    ['Makkah, Saudi Arabia', 'Makkah Holy Sites Ziyarat'],
    ['Madinah, Saudi Arabia', 'Madinah Ziyarat Highlights'],
    ['London, United Kingdom', 'Tower of London Entry'],
    ['Paris, France', 'Eiffel Tower Summit Access'],
    ['Rome, Italy', 'Colosseum & Roman Forum'],
    ['New York, United States', 'Statue of Liberty & Ellis Island'],
    ['Toronto, Canada', 'CN Tower Observation Deck'],
    ['Sydney, Australia', 'Sydney Opera House Guided Tour'],
    ['Auckland, New Zealand', 'Waiheke Island Wine & Coast Tour'],
    ['Nadi, Fiji', 'Mamanuca Islands Day Cruise'],
    ['Hunza Valley, Pakistan', 'Hunza Valley Forts & Village Tour'],
  ] as const
  for (const [destination, attraction] of hubs) {
    await page.goto('/results?type=tours&to=' + encodeURIComponent(destination) + '&out=2026-12-10', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: attraction })).toBeVisible()
    const links = markerLinks(page)
    await expect(links.first()).toHaveAttribute('href', /marker=806576/)
    await expect(links).toHaveCount(12)
    const names = await links.allTextContents()
    expect(names.join(' ')).toContain('Klook')
    expect(names.join(' ')).toContain('Tiqets')
    expect(names.join(' ')).toContain('GetYourGuide')
    expect(names.join(' ')).toContain('Viator')
  }
})
