import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test('homepage loads correctly', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/Syafiq Hadzir/);

        // Check main content exists
        await expect(page.locator('main')).toBeVisible();

        // Check navigation exists
        await expect(page.locator('nav')).toBeVisible();
    });

    test('can navigate to archive', async ({ page }) => {
        await page.goto('/');

        // Click archive link
        await page.click('text=Archive');

        // Verify archive page
        await expect(page).toHaveURL(/archive/);
        await expect(page.locator('h1')).toContainText('Archive');
    });

    test('can navigate to about', async ({ page }) => {
        await page.goto('/');

        // Click about link
        await page.click('text=About');

        // Verify about page
        await expect(page).toHaveURL(/about/);
        await expect(page.locator('h1')).toContainText('About');
    });

    test('can navigate to a blog post', async ({ page }) => {
        await page.goto('/archive.html');

        // Click first post link
        await page.locator('a[href*="/posts/"]').first().click();

        // Verify post page
        await expect(page.locator('article')).toBeVisible();
        await expect(page.locator('h1')).toBeVisible();
    });

    test('back link returns to homepage', async ({ page }) => {
        await page.goto('/about.html');

        // Click back link
        await page.click('text=..');

        // Verify homepage
        await expect(page).toHaveURL(/\/$/);
    });

    test('skip link is accessible', async ({ page }) => {
        await page.goto('/');

        // Tab to skip link
        await page.keyboard.press('Tab');

        // Skip link should be focused
        const skipLink = page.locator('.skip-link');
        await expect(skipLink).toBeFocused();
    });
});
