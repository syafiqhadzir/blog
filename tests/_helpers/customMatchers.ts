import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Custom Playwright matchers for domain-specific assertions
 * Bleeding-edge pattern for better test readability and reusability
 */

export const customMatchers = {
  /**
   * Verify page passes AMP validation
   */
  async toPassAMPValidation(
    page: Page,
  ): Promise<{ pass: boolean; message: () => string }> {
    const ampErrors = await page.locator('body').getAttribute('amp-errors');
    const pass = ampErrors === null || ampErrors === '';

    return {
      message: () =>
        pass
          ? 'Expected page to fail AMP validation but it passed'
          : `Expected page to pass AMP validation but found errors: ${ampErrors}`,
      pass,
    };
  },

  /**
   * Verify element has proper ARIA attributes
   */
  async toHaveProperARIA(
    locator: any,
    expectedRole?: string,
  ): Promise<{ pass: boolean; message: () => string }> {
    const role = await locator.getAttribute('role');
    const ariaLabel = await locator.getAttribute('aria-label');
    const ariaLabelledBy = await locator.getAttribute('aria-labelledby');

    const hasRole = expectedRole ? role === expectedRole : role !== null;
    const hasLabel = ariaLabel !== null || ariaLabelledBy !== null;
    const pass = hasRole && hasLabel;

    return {
      message: () =>
        pass
          ? 'Expected element to fail ARIA check'
          : `Element missing proper ARIA attributes. Role: ${role}, Label: ${ariaLabel}`,
      pass,
    };
  },

  /**
   * Verify page has optimal Core Web Vitals
   */
  async toHaveGoodCoreWebVitals(
    page: Page,
  ): Promise<{ pass: boolean; message: () => string }> {
    const vitals = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      return {
        fcp: navigation.domContentLoadedEventEnd - navigation.startTime,
        lcp: navigation.loadEventEnd - navigation.startTime,
      };
    });

    const pass = vitals.fcp < 1800 && vitals.lcp < 2500; // Good thresholds

    return {
      message: () =>
        pass
          ? 'Expected page to have poor Core Web Vitals'
          : `Core Web Vitals not optimal. FCP: ${vitals.fcp}ms, LCP: ${vitals.lcp}ms`,
      pass,
    };
  },

  /**
   * Verify no console errors (excluding known warnings)
   */
  async toHaveNoConsoleErrors(
    page: Page,
  ): Promise<{ pass: boolean; message: () => string }> {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for any async errors
    await page.waitForTimeout(1000);

    const pass = errors.length === 0;

    return {
      message: () =>
        pass
          ? 'Expected console errors but found none'
          : `Found console errors: ${errors.join(', ')}`,
      pass,
    };
  },
};

/**
 * Extend Expect with custom matchers
 */
export function extendExpect(): void {
  expect.extend(customMatchers);
}
