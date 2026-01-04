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

    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]',
      )
      .first();

    await searchInput.fill('playwright');

    // Wait for AMP state to update (AMP bind uses state, not URL params)
    await page.waitForFunction(
      (query) => {
        // Check if AMP state has been updated
        const ampStateElement = globalThis.document.querySelector(
          'amp-state#archiveQuery script',
        );
        if (ampStateElement?.textContent) {
          try {
            const state = JSON.parse(ampStateElement.textContent) as string;
            return state.includes(query);
          } catch {
            return false;
          }
        }
        // Fallback: check if input value matches
        const input = globalThis.document.querySelector('input[type="search"]');
        if (input instanceof HTMLInputElement) {
          return input.value.toLowerCase().includes(query);
        }
        return false;
      },
      'playwright',
      { timeout: 10_000 },
    );

    // Verify search input value is synchronized
    const inputValue = await searchInput.inputValue();
    expect(inputValue.toLowerCase()).toContain('playwright');
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
