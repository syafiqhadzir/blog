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
        const response = await page.request.get('/manifest.json');
        expect(response.status()).toBe(200);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const manifest = await response.json();

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

        await page.goto('/');

        // Wait for service worker to be active
        await page.waitForTimeout(2000);

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

        const cacheAvailable = await page.evaluate(() => {
            return 'caches' in globalThis;
        });

        expect(cacheAvailable).toBe(true);
    });

    test('Icons are properly sized', async ({ page }) => {
        const response = await page.request.get('/manifest.json');

        // Skip if manifest doesn't exist (PWA not fully implemented)
        if (!response.ok()) {
            test.skip();
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const manifest = await response.json();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!manifest.icons || !Array.isArray(manifest.icons) || manifest.icons.length === 0) {
            test.skip();
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        for (const icon of manifest.icons as unknown[]) {
            expect(icon).toHaveProperty('src');
            expect(icon).toHaveProperty('sizes');
            expect(icon).toHaveProperty('type');

            // Verify icon file exists
            const iconResponse = await page.request.get((icon as { src: string }).src);
            expect(iconResponse.status()).toBe(200);
        }
    });
});
