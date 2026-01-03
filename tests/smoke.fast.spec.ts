import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Fast Smoke Suite', { tag: '@fast' }, () => {
  test.beforeEach(async ({ blockAdsAndAnalytics, page }) => {
    await blockAdsAndAnalytics(page);
  });

  test('Homepage loads instantly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Syafiq Hadzir/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Archive loads and has posts', async ({ page }) => {
    await page.goto('/archive.html');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Latest post loads', async ({ getAllInternalRoutes, page }) => {
    const routes = await getAllInternalRoutes();
    const postRoute = routes.find((route) => route.includes('/posts/'));

    expect(
      postRoute,
      'At least one post should exist for smoke test',
    ).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await page.goto(postRoute!);
    await expect(page.locator('article')).toBeVisible();
  });

  test('Navigation works', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/archive"]');
    await expect(page).toHaveURL(/archive/);
  });
});
