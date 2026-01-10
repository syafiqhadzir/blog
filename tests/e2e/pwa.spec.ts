import { expect, test } from '@playwright/test';

test.describe('PWA & Service Worker', () => {
  test.beforeEach(async ({ page }) => {
    // Go to home page to trigger SW registration
    await page.goto('/');
  });

  test('should have amp-install-serviceworker tag', async ({ page }) => {
    const swTag = page.locator('amp-install-serviceworker');
    await expect(swTag).toBeVisible();
    await expect(swTag).toHaveAttribute('src', /sw\.js/);
    await expect(swTag).toHaveAttribute('data-iframe-src', /sw-install\.html/);
  });

  test('should have valid manifest linked', async ({ page }) => {
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    const href = await manifestLink.getAttribute('href');
    await expect(manifestLink).toHaveAttribute('href', /.+/);
    const response = await page.request.get(href ?? '');
    expect(response.status()).toBe(200);
    const json = (await response.json()) as Record<string, unknown>;
    expect(json['name']).toBeTruthy();
    expect((json['icons'] as unknown[]).length).toBeGreaterThan(0);
  });

  test('should register service worker (simulated)', async ({ page }) => {
    // Since AMP handles registration, we verify that the helper iframe is requested or compatible
    // Checking if sw.js is reachable
    const response = await page.request.get('/sw.js');
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain('workbox');
  });
});
