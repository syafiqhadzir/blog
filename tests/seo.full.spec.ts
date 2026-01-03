import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('SEO & Metadata', { tag: ['@full', '@seo'] }, () => {
    test('Homepage has correct metadata', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Syafiq Hadzir/);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /.+/);
    });

    test('Posts have Open Graph tags', async ({ getAllInternalRoutes, page }) => {
        const routes = await getAllInternalRoutes();
        const postRoute = routes.find((r) => r.includes('/posts/'));
        if (postRoute) {
            await page.goto(postRoute);
            await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
            await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
            // Ensure title matches
            const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
            const h1 = await page.locator('h1').textContent();
            expect(ogTitle).toBe(h1);
        }
    });

    test('Sitemap is valid', async ({ request }) => {
        const response = await request.get('/sitemap.xml');
        expect(response.ok()).toBeTruthy();
        const text = await response.text();
        expect(text).toContain('urlset');
    });

    test('RSS Feed is valid', async ({ request }) => {
        const response = await request.get('/feed.xml');
        expect(response.ok()).toBeTruthy();
        const text = await response.text();
        expect(text).toContain('<?xml');
    });
});
