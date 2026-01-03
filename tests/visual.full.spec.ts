import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Visual Regression', { tag: ['@full', '@visual'] }, () => {
    test.describe.configure({ mode: 'parallel' });

    test('Homepage visual snapshot', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveScreenshot('homepage.png', {
            fullPage: true,
            maxDiffPixels: 100,
        });
    });

    test('Archive page visual snapshot', async ({ page }) => {
        await page.goto('/archive.html');
        await expect(page).toHaveScreenshot('archive.png', {
            fullPage: true,
            maxDiffPixels: 100,
        });
    });

    test('Latest post visual snapshot', async ({ getAllInternalRoutes, page }) => {
        const routes = await getAllInternalRoutes();
        const postPattern = /\/\d{4}\/\d{2}\/\d{2}\//;
        const postRoutes = routes.filter((route) => postPattern.exec(route));

        if (postRoutes.length > 0 && postRoutes[0]) {
            await page.goto(postRoutes[0]);
            await expect(page).toHaveScreenshot('post-sample.png', {
                fullPage: true,
                maxDiffPixels: 100,
            });
        }
    });

    test('Tag page visual snapshot', async ({ page }) => {
        await page.goto('/tags.html');
        await expect(page).toHaveScreenshot('tags.png', {
            fullPage: true,
            maxDiffPixels: 100,
        });
    });
});
