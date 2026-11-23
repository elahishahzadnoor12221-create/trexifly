import { expect, test } from '@playwright/test'

const verifiedLinks = (page: import('@playwright/test').Page) => page.locator('a[data-affiliate-status="verified"]')

test('car listings retain 30 examples and expose only verified AutoEurope/QEEQ short links', async ({ page }) => {
  await page.goto('/results?type=cars&from=Heathrow%20Airport%2C%20London&to=Central%20London&out=2026-12-10&back=2026-12-14&pickupTime=09%3A30&dropTime=11%3A00&driverAge=35')
  await expect(page.getByRole('heading', { name: '30 options to compare' })).toBeVisible()
  const links = verifiedLinks(page)
  await expect(links).toHaveCount(60)
  const hrefs = await links.evaluateAll(nodes => nodes.map(node => (node as HTMLAnchorElement).href))
  expect(new Set(hrefs)).toEqual(new Set(['https://autoeurope.tpx.lv/1NuZscel', 'https://qeeq.tpx.lv/xVJH8wOZ']))
  await expect(page.locator('a[href*="discovercars.com"], a[href*="economybookings.com"]')).toHaveCount(0)
})

test('airport transfer listings retain 20 examples and show only clean GetTransfer/Intui links', async ({ page }) => {
  await page.goto('/results?type=transfers&service=airport-transfer&from=Dubai%20International%20Airport&to=Dubai%20Marina&out=2026-12-10&back=2026-12-12&pickupTime=08%3A15&passengers=3&luggage=4')
  await expect(page.getByRole('heading', { name: '20 options to compare' })).toBeVisible()
  const links = verifiedLinks(page)
  await expect(links).toHaveCount(40)
  const hrefs = await links.evaluateAll(nodes => nodes.map(node => (node as HTMLAnchorElement).href))
  expect(new Set(hrefs)).toEqual(new Set(['https://gettransfer.tpx.lv/dt5dWuQv', 'https://intui.tpx.lv/XuaKpcpV']))
  await expect(page.locator('a[href*="kiwitaxi.com"]')).toHaveCount(0)
})

test('activities hubs retain native listings and expose only verified Tiqets short links', async ({ page }) => {
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
    const links = verifiedLinks(page)
    await expect(links).toHaveCount(3)
    await expect(links.first()).toHaveAttribute('href', 'https://tiqets.tpx.lv/JkNGKSuf')
    await expect(page.locator('a[href*="getyourguide.com"], a[href*="viator.com"], a[href*="klook.com"]')).toHaveCount(0)
  }
})
