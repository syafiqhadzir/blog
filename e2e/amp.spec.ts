import { test, expect } from '@playwright/test';

test.describe('AMP Validation', () => {
    test('homepage is valid AMP', async ({ page }) => {
        await page.goto('/');

        // Check for AMP attribute on html tag
        const html = page.locator('html');
        // eslint-disable-next-line playwright/no-conditional-in-test
        const ampAttr = (await html.getAttribute('⚡')) ?? (await html.getAttribute('amp'));
        expect(ampAttr !== null).toBeTruthy();
    });

    test('has AMP boilerplate', async ({ page }) => {
        await page.goto('/');

        // Check for AMP boilerplate style
        const boilerplate = page.locator('style[amp-boilerplate]');
        await expect(boilerplate).toHaveCount(1);
    });

    test('has AMP runtime script', async ({ page }) => {
        await page.goto('/');

        // Check for AMP runtime
        const ampScript = page.locator('script[src*="cdn.ampproject.org/v0.js"]');
        await expect(ampScript).toHaveCount(1);
    });

    test('has canonical link', async ({ page }) => {
        await page.goto('/');

        // Check for canonical link
        const canonical = page.locator('link[rel="canonical"]');
        await expect(canonical).toHaveCount(1);
    });

    test('has viewport meta', async ({ page }) => {
        await page.goto('/');

        // Check for viewport
        const viewport = page.locator('meta[name="viewport"]');
        await expect(viewport).toHaveCount(1);
    });

    test('blog post has AMP', async ({ page }) => {
        await page.goto('/archive.html');

        // Navigate to first post
        await page.locator('a[href*="/posts/"]').first().click();

        // Check for AMP attribute
        const html = page.locator('html');
        // eslint-disable-next-line playwright/no-conditional-in-test
        const ampAttr = (await html.getAttribute('⚡')) ?? (await html.getAttribute('amp'));
        expect(ampAttr !== null).toBeTruthy();
    });

    test('has Schema.org structured data', async ({ page }) => {
        await page.goto('/');

        // Check for JSON-LD script
        const jsonLd = page.locator('script[type="application/ld+json"]');
        await expect(jsonLd).toHaveCount(1);
    });
});
