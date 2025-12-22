import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('theme toggle is visible', async ({ page }) => {
        const toggle = page.locator('button.theme-toggle.icon-moon');
        // It might be icon-sun if system is dark, so let's just check for the wrapper
        const wrapper = page.locator('.theme-toggle-wrapper');
        await expect(wrapper).toBeVisible();
    });

    test('switching theme updates body class', async ({ page }) => {
        // Initial state: ensure we are in a known state (e.g. forced light or defaults)
        // Since we use CSS media queries for visibility, playwright might need to click the visible one.

        // This test assumes default light mode (icon-moon visible)
        const moonIcon = page.locator('button.theme-toggle.icon-moon');
        if (await moonIcon.isVisible()) {
            await moonIcon.click();
            await expect(page.locator('body')).toHaveClass(/dark-theme/);

            // Now sun icon should be visible (conceptually, though our CSS makes it block/none based on body class too)
            // But wait, AMP bind updates the class.

            // Switch back
            const sunIcon = page.locator('button.theme-toggle.icon-sun');
            await sunIcon.click();
            await expect(page.locator('body')).toHaveClass(/light-theme/);
        } else {
            // Started in dark mode
            const sunIcon = page.locator('button.theme-toggle.icon-sun');
            await sunIcon.click();
            await expect(page.locator('body')).toHaveClass(/light-theme/);
        }
    });

    test('has valid accessibility attributes', async ({ page }) => {
        const wrapper = page.locator('.theme-toggle-wrapper');
        await expect(wrapper).toBeVisible();

        const button = page.locator('button.theme-toggle').first();
        await expect(button).toHaveAttribute('role', 'switch');
        await expect(button).toHaveAttribute('aria-label');
    });
});
