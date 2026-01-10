import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

/**
 * Optimized Smoke Suite - Bleeding-Edge Playwright Patterns
 * Uses Page Objects, test.step(), and parallel execution
 */
test.describe('Fast Smoke Suite', { tag: '@fast' }, () => {
  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ blockAdsAndAnalytics, page }) => {
    await blockAdsAndAnalytics(page);
  });

  test('Homepage loads instantly with all critical elements', async ({
    homePage,
  }) => {
    await test.step('Navigate to homepage', async () => {
      await homePage.navigate();
    });

    await test.step('Verify page loaded correctly', async () => {
      await homePage.verifyLoaded();
    });

    await test.step('Verify title is correct', async () => {
      await homePage.verifyTitle(/Syafiq Hadzir/);
    });
  });

  test('Archive page displays correctly', async ({ archivePage }) => {
    await test.step('Navigate to archive', async () => {
      await archivePage.navigate();
    });

    await test.step('Verify archive loaded', async () => {
      await archivePage.verifyLoaded();
    });

    await test.step('Verify posts are visible', async () => {
      const postCount = await archivePage.getVisiblePostCount();
      expect(postCount).toBeGreaterThan(0);
    });
  });

  test('Latest post loads and displays correctly', async ({
    archivePage,
    getAllInternalRoutes,
    page,
  }) => {
    const routes = await getAllInternalRoutes();
    const postRoute = routes.find((route) => route.includes('/posts/'));

    expect(
      postRoute,
      'At least one post should exist for smoke test',
    ).toBeDefined();

    await test.step('Navigate to latest post', async () => {
      await page.goto(postRoute!, { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify post article is visible', async () => {
      await expect(page.locator('article')).toBeVisible();
    });

    await test.step('Verify post has proper heading', async () => {
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test('Navigation between pages works smoothly', async ({ homePage }) => {
    await test.step('Start at homepage', async () => {
      await homePage.navigate();
    });

    await test.step('Navigate to archive', async () => {
      await homePage.goToArchive();
    });

    await test.step('Verify URL changed', async () => {
      await homePage.verifyURL(/archive/);
    });
  });

  test('Dark mode toggle functions correctly', async ({ homePage, page }) => {
    await test.step('Navigate to homepage', async () => {
      await homePage.navigate();
    });

    await test.step('Toggle dark mode', async () => {
      await homePage.toggleDarkMode();
    });

    await test.step('Verify dark mode applied', async () => {
      const htmlElement = page.locator('html');
      const theme = await htmlElement.getAttribute('data-theme');
      expect(theme).toBe('dark');
    });
  });
});
