import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe(
  'Accessibility Core Testing - WCAG 2.2 AAA',
  { tag: ['@full', '@a11y'] },
  () => {
    test('Homepage - WCAG 2.2 AAA compliance', async ({ page }) => {
      await page.goto('/');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags([
          'wcag2a',
          'wcag2aa',
          'wcag2aaa',
          'wcag21a',
          'wcag21aa',
          'wcag21aaa',
          'wcag22aa',
          'wcag22aaa',
        ])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Archive page - WCAG 2.2 AAA compliance', async ({ page }) => {
      await page.goto('/archive.html');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags([
          'wcag2a',
          'wcag2aa',
          'wcag2aaa',
          'wcag21a',
          'wcag21aa',
          'wcag21aaa',
          'wcag22aa',
          'wcag22aaa',
        ])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Post page - WCAG 2.2 AAA compliance', async ({
      getAllInternalRoutes,
      page,
    }) => {
      const routes = await getAllInternalRoutes();
      const postPattern = /\/\d{4}\/\d{2}\/\d{2}\//;
      const postRoutes = routes.filter((route) => postPattern.test(route));

      expect(
        postRoutes.length,
        'At least one post route should exist',
      ).toBeGreaterThan(0);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await page.goto(postRoutes[0]!);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags([
          'wcag2a',
          'wcag2aa',
          'wcag2aaa',
          'wcag21a',
          'wcag21aa',
          'wcag21aaa',
          'wcag22aa',
          'wcag22aaa',
        ])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Page has valid lang attribute', async ({ page }) => {
      await page.goto('/');

      const lang = await page.getAttribute('html', 'lang');

      // Lang attribute must exist and be valid
      expect(lang).toBeTruthy();
      expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., 'en' or 'en-US'
    });

    test('Heading hierarchy is logical and complete', async ({ page }) => {
      await page.goto('/');

      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      const headingLevels: number[] = [];

      for (const heading of headings) {
        const tagName = await heading.evaluate((element) =>
          element.tagName.toLowerCase(),
        );
        const level = Number.parseInt(tagName.replace('h', ''), 10);
        headingLevels.push(level);
      }

      // Should have exactly one h1
      const h1Count = headingLevels.filter((level) => level === 1).length;
      expect(h1Count).toBe(1);

      // Headings should not skip levels (e.g., h1 -> h3)
      // Check that when going up in heading level, we only go up by 1
      const violations = headingLevels
        .slice(1)
        .map((current, index) => {
          const previous = headingLevels[index] ?? 0;
          return current - previous;
        })
        .filter((difference) => difference > 1);

      expect(violations, 'Heading hierarchy should not skip levels').toEqual(
        [],
      );
    });
  },
);
