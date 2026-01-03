import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Full Page Coverage', { tag: '@full' }, () => {
  test.describe.configure({ mode: 'parallel' });

  test('Visit every generated HTML page', async ({
    blockAdsAndAnalytics,
    getAllInternalRoutes,
    page,
  }) => {
    // In full mode, we might blocks ads/analytics too to reduce noise, or keep them to test real behavior?
    // Requirements say: PERF_MODE false in nightly. Fixture handles logic.
    // We'll call the blocker anyway; fixture decides based on env.
    await blockAdsAndAnalytics(page);

    const routes = await getAllInternalRoutes();

    const errors: string[] = [];

    // Batch processing if array is huge?
    // For < 1000 pages, generic serial visit in one worker is simplest but slow.
    // Parallelism is set at file level.
    // To truly parallelize page visits, we'd need multiple tests.
    // But routes are discovered runtime.
    // We'll iterate.

    for (const route of routes) {
      if (
        route.includes('.xml') ||
        route.includes('.txt') ||
        route.includes('.json') ||
        route.includes('.js') ||
        route.includes('.css')
      )
        continue;

      await test.step(`Visit ${route}`, async () => {
        const response = await page.goto(route, {
          waitUntil: 'domcontentloaded',
        });

        if (!response) {
          errors.push(`${route}: No response`);
          return;
        }

        if (response.status() >= 400) {
          // Double check if it's a 404 page that is actually expected?
          // No, "getAllInternalRoutes" finds files that exist.
          // If we goto a file that exists and get 404, server configuration or issue.
          // Exception: The 404.html page itself should return 404?
          // http-server usually serves file with 200 if you ask for /404.html directly.
          if (route.includes('404')) return;
          errors.push(`${route}: Status ${String(response.status())}`);
        }

        // Generic content checks
        const title = await page.title();
        if (!title) errors.push(`${route}: Empty title`);
      });
    }

    expect(errors, `Failed pages:\n${errors.join('\n')}`).toHaveLength(0);
  });
});
