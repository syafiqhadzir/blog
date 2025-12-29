import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 * Captures screenshots of key pages to detect unintended visual changes.
 * Run with --update-snapshots to update baseline images.
 */
test.describe('Visual Regression', () => {
    test.describe.configure({ mode: 'parallel' });

    test('homepage renders correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        // Full page screenshot
        await expect(page).toHaveScreenshot('homepage.png', {
            fullPage: true,
        });
    });

    test('about page renders correctly', async ({ page }) => {
        await page.goto('/about');
        await page.waitForLoadState('domcontentloaded');

        await expect(page).toHaveScreenshot('about.png', {
            fullPage: true,
        });
    });

    test('archive page renders correctly', async ({ page }) => {
        await page.goto('/archive');
        await page.waitForLoadState('domcontentloaded');

        await expect(page).toHaveScreenshot('archive.png', {
            fullPage: true,
        });
    });

    test('blog post renders correctly', async ({ page }) => {
        // Navigate to first blog post
        await page.goto('/');
        const firstPost = page.locator('a[href*="/posts/"]').first();
        await firstPost.click();
        await page.waitForLoadState('domcontentloaded');

        await expect(page).toHaveScreenshot('blog-post.png', {
            fullPage: true,
        });
    });

    test('dark mode renders correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        // Toggle to dark mode - click if button exists
        const toggle = page.locator('button.theme-toggle');
        await toggle.click();

        // Wait for theme transition animation
        await page.locator('body.dark-theme').waitFor({ state: 'attached' });

        await expect(page).toHaveScreenshot('homepage-dark.png', {
            fullPage: true,
        });
    });

    test('404 page renders correctly', async ({ page }) => {
        await page.goto('/nonexistent-page-12345');
        await page.waitForLoadState('domcontentloaded');

        await expect(page).toHaveScreenshot('404.png', {
            fullPage: true,
        });
    });
});

test.describe('Component Visual Tests', () => {
    test('navigation menu renders correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        const nav = page.locator('main.page-content').first();
        await expect(nav).toHaveScreenshot('navigation.png');
    });

    test('code block renders correctly', async ({ page }) => {
        // Find a post with code blocks
        await page.goto('/');

        // Take screenshot of code block element
        const codeBlock = page.locator('div.highlighter-rouge').first();
        await expect(codeBlock).toHaveScreenshot('code-block.png');
    });
});
