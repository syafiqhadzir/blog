import type { Page, Response } from '@playwright/test';

import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Global Site Audit (100% Coverage)', { tag: '@full' }, () => {
  test.describe.configure({ mode: 'parallel' });

  test('Every generated page must be valid and high-quality', async ({
    blockAdsAndAnalytics,
    getAllInternalRoutes,
    page,
  }) => {
    test.setTimeout(300 * 1000);
    await blockAdsAndAnalytics(page);
    const routes = await getAllInternalRoutes();

    const htmlRoutes = routes.filter(
      (route) =>
        !route.endsWith('.xml') &&
        !route.endsWith('.txt') &&
        !route.endsWith('.json') &&
        !route.endsWith('.js') &&
        !route.endsWith('.css') &&
        !route.includes('sw-install.html'),
    );

    // Ensure we are actually finding all pages
    process.stdout.write(
      `Found ${String(htmlRoutes.length)} HTML routes to audit.\n`,
    );
    expect(htmlRoutes.length).toBeGreaterThan(0);

    for (const route of htmlRoutes) {
      await test.step(`Audit ${route}`, async () => {
        const response = await page.goto(route, {
          waitUntil: 'domcontentloaded',
        });

        validateResponse(route, response);
        await validateAccessibilityFeatures(route, page);
        await validateAmp(route, page);
        await validateSeo(route, page);
      });
    }
  });
});

async function validateAccessibilityFeatures(
  route: string,
  page: Page,
): Promise<void> {
  const hasFlashingContent = await page.evaluate(() => {
    const animations = document.getAnimations();
    return animations.some((anim) => {
      const effect = anim.effect;
      if (!effect || !('getTiming' in effect)) return false;
      const timing = effect.getTiming();
      const infinityValue = Number.POSITIVE_INFINITY;
      const loopThreshold = 3;
      const isLooping =
        timing.iterations === infinityValue ||
        Number(timing.iterations) > loopThreshold;
      const durationThreshold = 333;
      return (
        isLooping &&
        timing.duration !== 'auto' &&
        Number(timing.duration) < durationThreshold
      );
    });
  });
  expect(hasFlashingContent, `${route}: Detected flashing content`).toBe(false);
}

async function validateAmp(route: string, page: Page): Promise<void> {
  const ampRuntime = page.locator('script[src*="cdn.ampproject.org/v0.js"]');
  await expect(ampRuntime, `${route}: Missing AMP runtime`).toHaveCount(1);

  const viewport = page.locator('meta[name="viewport"]');
  await expect(viewport, `${route}: Missing viewport`).toHaveAttribute(
    'content',
    /.+/,
  );
}

function validateResponse(route: string, response: null | Response): void {
  expect(response, `${route}: No response`).not.toBeNull();
  if (response) {
    const status = response.status();
    const okStatusThreshold = 400;
    const isExpected404 = route.includes('404');
    const isSuccess = status < okStatusThreshold || isExpected404;
    expect(isSuccess, `${route}: Unexpected status ${String(status)}`).toBe(
      true,
    );
  }
}

async function validateSeo(route: string, page: Page): Promise<void> {
  const title = await page.title();
  const minTitleLength = 10;
  expect(title.length, `${route}: Poor title`).toBeGreaterThanOrEqual(
    minTitleLength,
  );

  const description = await page
    .locator('meta[name="description"]')
    .getAttribute('content');
  const minDescLength = 50;
  expect(
    description?.length ?? 0,
    `${route}: Poor description`,
  ).toBeGreaterThanOrEqual(minDescLength);

  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical, `${route}: Missing canonical`).toHaveAttribute(
    'href',
    /.+/,
  );
}
