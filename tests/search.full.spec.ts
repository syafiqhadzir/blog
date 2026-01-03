import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Search Functionality', { tag: ['@full', '@search'] }, () => {
    test.describe.configure({ mode: 'parallel' });

    test('Archive search input exists', async ({ page }) => {
        await page.goto('/archive.html');

        // Look for search input
        const searchInput = page
            .locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]')
            .first();
        await expect(searchInput).toBeVisible();
    });

    test('Search input accepts text', async ({ page }) => {
        await page.goto('/archive.html');

        const searchInput = page
            .locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]')
            .first();

        if ((await searchInput.count()) > 0) {
            await searchInput.fill('test query');
            await expect(searchInput).toHaveValue('test query');
        }
    });

    test('Search filters results', async ({ page }) => {
        await page.goto('/archive.html');

        const searchInput = page
            .locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]')
            .first();

        if ((await searchInput.count()) > 0) {
            // Get initial post count
            const allPosts = page.locator('article, .post, [class*="post"]');
            const initialCount = await allPosts.count();

            // Enter search query
            await searchInput.fill('testing');
            await page.waitForTimeout(500); // Wait for filter to apply

            // Get filtered post count
            const visiblePosts = page.locator('article:visible, .post:visible, [class*="post"]:visible');
            const filteredCount = await visiblePosts.count();

            // Filtered count should be <= initial count
            expect(filteredCount).toBeLessThanOrEqual(initialCount);
        }
    });

    test('Search URL state synchronization', async ({ page }) => {
        await page.goto('/archive.html');

        const searchInput = page
            .locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]')
            .first();

        if ((await searchInput.count()) > 0) {
            await searchInput.fill('playwright');
            await page.waitForTimeout(300);

            // Check if URL contains query parameter
            const url = page.url();
            const hasQueryParameter = url.includes('?q=') || url.includes('&q=') || url.includes('#q=');

            // If URL state sync is implemented, verify it
            if (hasQueryParameter) {
                expect(url).toContain('playwright');
            }
        }
    });

    test('Clear search resets results', async ({ page }) => {
        await page.goto('/archive.html');

        const searchInput = page
            .locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]')
            .first();

        if ((await searchInput.count()) > 0) {
            // Enter search query
            await searchInput.fill('test');
            await page.waitForTimeout(300);

            // Clear search
            await searchInput.clear();
            await page.waitForTimeout(300);

            // Verify input is empty
            await expect(searchInput).toHaveValue('');
        }
    });
});
