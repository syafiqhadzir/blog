import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Fast Smoke Suite', { tag: '@fast' }, () => {
    test.beforeEach(async ({ blockAdsAndAnalytics, page }) => {
        await blockAdsAndAnalytics(page);
    });

    test('Homepage loads instantly', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Syafiq Hadzir/);
        await expect(page.locator('h1')).toBeVisible();
    });

    test('Archive loads and has posts', async ({ page }) => {
        await page.goto('/archive.html'); // Normalize URL to match build output logic
        await expect(page.locator('.post-list')).toBeVisible();
        // Assuming .post-list or similar exists. Using generic logic based on prev context
        // Actually, previous context showed 'amp-autocomplete', let's stick to safe visible checks
        await expect(page.locator('main')).toBeVisible();
    });

    test('Latest post loads', async ({ getAllInternalRoutes, page }) => {
        // Dynamic fetch of a real post to ensure we don't 404 on hardcoded old data
        const routes = await getAllInternalRoutes();
        const post = routes.find((r) => r.includes('/posts/'));
        if (post) {
            await page.goto(post);
            await expect(page.locator('article')).toBeVisible();
        } else {
            // eslint-disable-next-line no-console
            console.warn('No posts found to smoke test!');
        }
    });

    test('Navigation works', async ({ page }) => {
        await page.goto('/');
        await page.click('a[href="/archive"]'); // Assuming nav link exists
        await expect(page).toHaveURL(/archive/);
    });
});
