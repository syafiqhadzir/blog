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
          return registration != undefined;
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

    const manifest = (await response.json()) as Record<string, unknown>;
    expect(manifest).not.toBeNull();

    // Verify required manifest fields
    expect(manifest['name']).toBeDefined();
    expect(manifest['short_name']).toBeDefined();
    expect(manifest['start_url']).toBeDefined();
    expect(manifest['display']).toBeDefined();
    expect(manifest['icons']).toBeDefined();
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

    const manifest = (await response.json()) as Record<string, unknown>;
    const icons = manifest['icons'];

    expect(Array.isArray(icons)).toBe(true);
    const safeIcons = icons as Array<Record<string, unknown>>;

    for (const icon of safeIcons) {
      expect(icon['src']).toBeDefined();
      expect(icon['sizes']).toBeDefined();
      expect(icon['type']).toBeDefined();

      const source = icon['src'];
      expect(typeof source).toBe('string');
      const iconResponse = await page.request.get(source as string);
      expect(iconResponse.status()).toBe(200);
    }
  });
});
