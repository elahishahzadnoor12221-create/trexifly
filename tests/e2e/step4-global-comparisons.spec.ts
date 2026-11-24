import { expect, test } from '@playwright/test'

const verifiedLinks = (page: import('@playwright/test').Page) => page.locator('a[data-affiliate-status="verified"]')

test('car rental search uses verified partner handoffs instead of fabricated vehicles or prices', async ({ page }) => {
  await page.goto('/results?type=cars&from=Heathrow%20Airport%2C%20London&to=Central%20London&out=2026-12-10&back=2026-12-14&pickupTime=09%3A30&dropTime=11%3A00&driverAge=35')
  await expect(page.getByRole('heading', { name: 'Car rentals in Heathrow Airport, London' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Continue with a verified booking partner' })).toBeVisible()
  const links = verifiedLinks(page)
  await expect(links).toHaveCount(2)
  const redirects = await links.evaluateAll(nodes => nodes.map(node => {
    const anchor = node as HTMLAnchorElement
    const url = new URL(anchor.href)
    return { id: anchor.dataset.affiliatePartner, endpoint: url.pathname, fallback: anchor.dataset.affiliateFallback }
  }))
  expect(redirects).toEqual(expect.arrayContaining([
    { id: 'autoeurope', endpoint: '/api/affiliates/link', fallback: 'https://autoeurope.tpx.lv/1NuZscel' },
    { id: 'qeeq', endpoint: '/api/affiliates/link', fallback: 'https://qeeq.tpx.lv/n9oGqafJ' },
  ]))
  await expect(page.getByText(/Trexifly does not operate vehicles, tours or transfer services/i)).toBeVisible()
  await expect(page.locator('main article')).toHaveCount(0)
})

test('airport transfers use verified GetTransfer/Intui/Kiwitaxi handoffs instead of generated vehicles or fares', async ({ page }) => {
  await page.goto('/results?type=transfers&service=airport-transfer&from=Dubai%20International%20Airport&to=Dubai%20Marina&out=2026-12-10&back=2026-12-12&pickupTime=08%3A15&passengers=3&luggage=4')
  await expect(page.getByRole('heading', { name: 'Airport transfers' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Continue with a verified booking partner' })).toBeVisible()
  const links = verifiedLinks(page)
  await expect(links).toHaveCount(3)
  const redirects = await links.evaluateAll(nodes => nodes.map(node => {
    const anchor = node as HTMLAnchorElement
    const url = new URL(anchor.href)
    return { id: anchor.dataset.affiliatePartner, endpoint: url.pathname, fallback: anchor.dataset.affiliateFallback }
  }))
  expect(redirects).toEqual(expect.arrayContaining([
    { id: 'gettransfer', endpoint: '/api/affiliates/link', fallback: 'https://gettransfer.tpx.lv/yYXGNhMm' },
    { id: 'intui', endpoint: '/api/affiliates/link', fallback: 'https://intui.tpx.lv/6QOOPhJd' },
    { id: 'kiwitaxi', endpoint: '/api/affiliates/link', fallback: 'https://kiwitaxi.tpx.lv/wN8KUFkg' },
  ]))
  await expect(page.locator('a[data-affiliate-partner="kiwitaxi"]')).toHaveCount(1)
  await expect(page.locator('main article')).toHaveCount(0)
})

test('activities destinations use the verified Tiqets handoff without fabricated attractions or prices', async ({ page }) => {
  const hubs = [
    'Dubai, United Arab Emirates',
    'Makkah, Saudi Arabia',
    'Madinah, Saudi Arabia',
    'London, United Kingdom',
    'Paris, France',
    'Rome, Italy',
    'New York, United States',
    'Toronto, Canada',
    'Sydney, Australia',
    'Auckland, New Zealand',
    'Nadi, Fiji',
    'Hunza Valley, Pakistan',
  ]
  for (const destination of hubs) {
    await page.goto('/results?type=tours&to=' + encodeURIComponent(destination) + '&out=2026-12-10', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Activities in ' + destination })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Continue with a verified booking partner' })).toBeVisible()
    const links = verifiedLinks(page)
    await expect(links).toHaveCount(1)
    const redirect = await links.first().evaluate(node => {
      const anchor = node as HTMLAnchorElement
      const url = new URL(anchor.href)
      return { id: anchor.dataset.affiliatePartner, endpoint: url.pathname, fallback: anchor.dataset.affiliateFallback }
    })
    expect(redirect).toEqual({ id: 'tiqets', endpoint: '/api/affiliates/link', fallback: 'https://tiqets.tpx.lv/sSYehXWU' })
    await expect(page.locator('main article')).toHaveCount(0)
  }
})
