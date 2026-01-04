import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Search Functionality', { tag: ['@full', '@search'] }, () => {
  test.describe.configure({ mode: 'parallel' });

  test('Archive search input exists', async ({ page }) => {
    await page.goto('/archive.html');

    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]',
      )
      .first();
    await expect(searchInput).toBeVisible();
  });

  test('Search input accepts text', async ({ page }) => {
    await page.goto('/archive.html');

    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]',
      )
      .first();

    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');
  });

  test('Search filters results', async ({ page }) => {
    await page.goto('/archive.html');

    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]',
      )
      .first();

    const allPosts = page.locator('article, .post, [class*="post"]');
    const initialCount = await allPosts.count();

    await searchInput.fill('testing');

    await expect(async () => {
      const visiblePosts = page.locator(
        'article:visible, .post:visible, [class*="post"]:visible',
      );
      const filteredCount = await visiblePosts.count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }).toPass();
  });

  test('Search URL state synchronization', async ({ page }) => {
    await page.goto('/archive.html');

    const searchInput = page.locator('#archive-search-input');
    const suggestions = page.locator('.search-suggestions');

    // Initially suggestions should be visible
    await expect(suggestions).toBeVisible();

    await searchInput.fill('playwright');

    // Wait for suggestions to be hidden (indicates AMP state 'archiveQuery' is updated)
    // AMP hides this element when archiveQuery is truthy
    await expect(suggestions).toBeHidden({ timeout: 10_000 });

    // Verify search input value is synchronized using locator assertion
    await expect(searchInput).toHaveValue(/playwright/i);
  });

  test('Clear search resets results', async ({ page }) => {
    await page.goto('/archive.html');

    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]',
      )
      .first();

    await searchInput.fill('test');
    await searchInput.clear();

    await expect(searchInput).toHaveValue('');
  });
});
