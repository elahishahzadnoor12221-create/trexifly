import { expect, test } from '@playwright/test';

test('TREXIFLY homepage responds and renders a document body', async ({ page }) => {
  const response = await page.goto('/');

  expect(response, 'Homepage should return an HTTP response').not.toBeNull();
  expect(response!.status(), 'Homepage should not return an HTTP error').toBeLessThan(400);
  await expect(page.locator('body')).not.toBeEmpty();
});
