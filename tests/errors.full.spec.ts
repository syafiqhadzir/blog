import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Error Handling', { tag: ['@full', '@errors'] }, () => {
    test('404 Page is served correctly', async ({ page }) => {
        const response = await page.goto('/non-existent-page-12345');
        // http-server might return 404 if configured, or 200 if it serves a custom 404 page file directly?
        // Usually static servers return 404 for bad paths.
        expect(response?.status()).toBe(404);
        await expect(page.locator('h1')).toContainText(/404|not found/i);
    });

    test('URL Normalization (Trailing slashes)', async ({ request }) => {
        // Jekyll usually redirects or handles trailing slashes.
        // We just want to ensure we don't error out.
        const response = await request.get('/');
        expect(response.ok()).toBeTruthy();

        const responseSlash = await request.get('/archive/'); // Assuming folder
        // If /archive/ exists as a folder with index.html, it should be 200
        // If it's just archive.html, /archive/ might 404 depending on server.
        // We'll just check home availability as basic normalization test.
        expect(responseSlash.ok()).toBeTruthy();
    });
});
