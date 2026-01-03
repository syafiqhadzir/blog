import { expect, test } from '@playwright/test';

test.describe('Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('theme toggle is visible', async ({ page }) => {
    // Check for the wrapper regardless of current theme
    const wrapper = page.locator('.theme-toggle-wrapper');
    await expect(wrapper).toBeVisible();
  });

  test('switching from light to dark theme', async ({ page }) => {
    // Ensure we start in light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const body = page.locator('body');

    // Click moon icon to switch to dark theme
    const moonIcon = page.locator('button.theme-toggle.icon-moon');
    await moonIcon.click();
    await expect(body).toHaveClass(/dark-theme/);
  });

  test('switching from dark to light theme', async ({ page }) => {
    // Ensure we start in dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    const body = page.locator('body');

    // Click sun icon to switch to light theme
    const sunIcon = page.locator('button.theme-toggle.icon-sun');
    await sunIcon.click();
    await expect(body).toHaveClass(/light-theme/);
  });

  test('has valid accessibility attributes', async ({ page }) => {
    const wrapper = page.locator('.theme-toggle-wrapper');
    await expect(wrapper).toBeVisible();

    const button = page.locator('button.theme-toggle').first();
    await expect(button).toHaveAttribute('role', 'switch');
    await expect(button).toHaveAttribute('aria-label');
  });
});
