import { expect, test } from '@playwright/test';

test('local API endpoints return valid JSON in browser and AI chat uses the safe fallback', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const localNetworkErrors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => {
    if (request.url().startsWith('http://127.0.0.1:4173')) localNetworkErrors.push(request.url() + ' :: ' + (request.failure()?.errorText ?? 'failed'));
  });
  const tinySvg = '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"></svg>';
  await page.route('https://tpembars.com/**', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.route('https://open.er-api.com/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('https://photon.komoot.io/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"features":[]}' }));
  await page.route('https://nominatim.openstreetmap.org/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route('https://images.unsplash.com/**', route => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: tinySvg }));
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);

  const health = await page.evaluate(async () => {
    const response = await fetch('/api/health');
    return { status: response.status, contentType: response.headers.get('content-type'), body: await response.json() };
  });
  expect(health.status).toBe(200);
  expect(health.contentType).toContain('application/json');
  expect(health.body).toMatchObject({ ok: true, service: 'trexifly', ai: 'available' });

  const aiResponse = await page.request.post('/api/ai-chat', { data: { message: 'Hello Trexifly' } });
  expect(aiResponse.status()).toBe(200);
  expect(aiResponse.headers()['content-type']).toContain('application/json');
  const aiBody = await aiResponse.json();
  expect(aiBody.reply).toBe("Sorry, I'm having trouble connecting right now. Please try again or click WhatsApp for instant booking help.");

  await page.getByRole('button', { name: 'Open AI travel assistant' }).click();
  await page.locator('#trexifly-ai-message').fill('Please help me plan a trip.');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText(aiBody.reply, { exact: false })).toBeVisible({ timeout: 30000 });

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(localNetworkErrors).toEqual([]);
});
