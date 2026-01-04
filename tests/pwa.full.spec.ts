import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('PWA Functionality', { tag: ['@full', '@pwa'] }, () => {
  test.describe.configure({ mode: 'parallel' });

  test('Service worker registers successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for service worker registration
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          return !!registration;
        } catch {
          return false;
        }
      }
      return false;
    });

    expect(swRegistered).toBe(true);
  });

  test('Service worker file exists', async ({ page }) => {
    const response = await page.request.get('/sw.js');
    expect(response.status()).toBe(200);

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('javascript');
  });

  test('Manifest file exists and is valid', async ({ page }) => {
    const response = await page.request.get('/site.webmanifest');
    expect(response.status()).toBe(200);

    const manifest = (await response.json()) as {
      display: string;
      icons: unknown[];
      name: string;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      short_name: string;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      start_url: string;
    };

    // Verify required manifest fields
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('start_url');
    expect(manifest).toHaveProperty('display');
    expect(manifest).toHaveProperty('icons');
  });

  test('Offline page loads when service worker active', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for service worker to be active and controlling the page
    const swActivated = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        // Wait for service worker to control the page
        if (!navigator.serviceWorker.controller) {
          await new Promise((resolve) => {
            navigator.serviceWorker.addEventListener(
              'controllerchange',
              resolve,
              {
                once: true,
              },
            );
          });
        }
        return !!registration.active;
      }
      return false;
    });

    expect(swActivated).toBe(true);

    // Prime the cache by visiting the archive page while online
    await page.goto('/archive.html', { waitUntil: 'networkidle' });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Go offline
    await context.setOffline(true);

    // Try to navigate to a page
    await page.goto('/archive.html', { waitUntil: 'domcontentloaded' });

    // Page should load (from cache or offline page)
    const title = await page.title();
    expect(title).toBeTruthy();

    await context.close();
  });

  test('Cache API is available', async ({ page }) => {
    await page.goto('/');

    const cacheAvailable = await page.evaluate(() => 'caches' in globalThis);

    expect(cacheAvailable).toBe(true);
  });

  test('Icons are properly sized', async ({ page }) => {
    const response = await page.request.get('/site.webmanifest');
    expect(response.ok(), 'Manifest should exist').toBe(true);

    const manifest = (await response.json()) as {
      icons: { sizes: string; src: string; type: string }[];
    };

    expect(manifest.icons).toBeDefined();
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);

    for (const icon of manifest.icons) {
      expect(icon).toHaveProperty('src');
      expect(icon).toHaveProperty('sizes');
      expect(icon).toHaveProperty('type');

      // Verify icon file exists
      const iconResponse = await page.request.get(icon.src);
      expect(iconResponse.status()).toBe(200);
    }
  });
});
