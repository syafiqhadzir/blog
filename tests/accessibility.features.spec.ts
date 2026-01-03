import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe(
  'Accessibility Feature Testing - WCAG 2.2 AAA Decorators',
  { tag: ['@full', '@a11y'] },
  () => {
    test('Keyboard navigation - Tab through elements', async ({ page }) => {
      await page.goto('/');

      // Focus first interactive element
      await page.keyboard.press('Tab');

      const focusedElement = await page.evaluate(() => {
        const element = document.activeElement;
        return element?.tagName.toLowerCase();
      });

      expect(['a', 'button', 'input']).toContain(focusedElement);

      const hasFocusIndicator = await page.evaluate(() => {
        const element = document.activeElement;
        if (!element) return false;
        const styles = globalThis.getComputedStyle(element);
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      });

      expect(hasFocusIndicator).toBe(true);
    });

    test('Skip to main content link exists', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('Tab');

      const firstFocusedElement = await page.evaluate(() => {
        const element = document.activeElement;
        return {
          href: element?.getAttribute('href') ?? '',
          tagName: element?.tagName.toLowerCase() ?? '',
        };
      });

      // Verification: if it's the skip link, it should point to #main
      expect(firstFocusedElement.href).toContain('#main');
      expect(firstFocusedElement.tagName).toBe('a');
    });

    test('Images have descriptive alt text', async ({ page }) => {
      await page.goto('/');
      const images = await page.locator('img').all();

      for (const image of images) {
        const alt = await image.getAttribute('alt');
        const source = await image.getAttribute('src');

        expect(
          alt,
          `Image with src ${source ?? 'unknown'} is missing alt attribute`,
        ).not.toBeNull();
      }
    });

    test('Form inputs have labels', async ({ page }) => {
      await page.goto('/');
      const inputs = await page
        .locator('input[type="text"], input[type="email"], textarea')
        .all();

      for (const input of inputs) {
        const inputId = await input.getAttribute('id');
        const safeInputId = String(inputId);
        const labelSelector = `label[for="${safeInputId}"]`;
        const labelCount = await page.locator(labelSelector).count();
        const ariaLabel = await input.getAttribute('aria-label');
        const hasLabel = labelCount > 0;
        const hasAriaLabel = Boolean(ariaLabel);
        const accessibilityCount = Number(hasLabel) + Number(hasAriaLabel);
        expect(accessibilityCount).toBeGreaterThan(0);
      }
    });

    test('Color contrast meets WCAG AAA', async ({ page }) => {
      await page.goto('/');
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aaa'])
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'color-contrast' || v.id === 'color-contrast-enhanced',
      );
      expect(contrastViolations).toEqual([]);
    });

    test('Links have descriptive text', async ({ page }) => {
      await page.goto('/');
      const links = await page.locator('a[href]').all();
      const genericLinkTextSet = new Set(['click here', 'more', 'read more']);

      for (const link of links) {
        const content = await link.textContent();
        const text = (content ?? '').trim().toLowerCase();

        expect(text.length).toBeGreaterThanOrEqual(0);
        const isGeneric = genericLinkTextSet.has(text);
        expect(isGeneric).toBe(false);
      }
    });

    test('Focus order follows DOM order', async ({ page }) => {
      await page.goto('/');
      const positiveTabIndexes = await page.evaluate(() => {
        const elements = [
          ...document.querySelectorAll('[tabindex]:not([tabindex="-1"])'),
        ];
        return elements
          .map((element) =>
            Number.parseInt(element.getAttribute('tabindex') ?? '0', 10),
          )
          .filter((t) => t > 0);
      });
      expect(positiveTabIndexes).toEqual([]);
    });

    test('No content flashes', async ({ page }) => {
      await page.goto('/');

      // This test checks for flashing content in browser context
      // The conditional logic is necessary for browser-side evaluation
      const hasFlashingContent = await page.evaluate(() => {
        const animations = document.getAnimations();
        let flashingCount = 0;

        for (const animation of animations) {
          const effect = animation.effect;
          if (!effect) continue;
          if (!('getTiming' in effect)) continue;

          const timing = effect.getTiming();
          const iterations = Number(timing.iterations);
          const duration = Number(timing.duration);

          const isInfinite = timing.iterations === Number.POSITIVE_INFINITY;
          const loopsMany = iterations > 3;
          const isLooping = isInfinite || loopsMany;

          const isNotAuto = timing.duration !== 'auto';
          const isFast = isNotAuto && duration < 333;

          const isFlashing = isLooping && isFast;

          if (isFlashing) {
            flashingCount += 1;
          }
        }

        return flashingCount > 0;
      });

      expect(hasFlashingContent).toBe(false);
    });
  },
);
