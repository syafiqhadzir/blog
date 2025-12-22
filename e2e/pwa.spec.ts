import { test, expect } from '@playwright/test';

test.describe('PWA Features', () => {
    test('has web manifest', async ({ page }) => {
        await page.goto('/');

        // Check for manifest link
        const manifest = page.locator('link[rel="manifest"]');
        await expect(manifest).toHaveCount(1);
    });

    test('manifest is valid JSON', async ({ page, request }) => {
        const response = await request.get('/site.webmanifest');
        expect(response.ok()).toBeTruthy();

        const manifest = await response.json();
        expect(manifest.name).toBe('Syafiq Hadzir Blog');
        expect(manifest.icons.length).toBeGreaterThan(0);
    });

    test('has theme-color meta', async ({ page }) => {
        await page.goto('/');

        // Check for theme-color
        const themeColor = page.locator('meta[name="theme-color"]');
        await expect(themeColor).toHaveCount(1);
    });

    test('has apple-touch-icon', async ({ page }) => {
        await page.goto('/');

        // Check for apple-touch-icon
        const appleIcon = page.locator('link[rel="apple-touch-icon"]');
        await expect(appleIcon).toHaveCount(1);
    });

    test('service worker is registered', async ({ page }) => {
        await page.goto('/');

        // Check for amp-install-serviceworker component
        const swComponent = page.locator('amp-install-serviceworker');
        await expect(swComponent).toHaveCount(1);
    });

    test('offline page exists', async ({ request }) => {
        const response = await request.get('/offline.html');
        expect(response.ok()).toBeTruthy();
    });
});
