import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test.describe.configure({ mode: 'parallel' });
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

    // Click archive link (actual text is "See archive...")
    await page.click('text=See archive...');

    // Verify archive page
    await expect(page).toHaveURL(/archive/);
    await expect(page.locator('h1')).toContainText('Archive');
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
    await page.goto('/tags.html');

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
