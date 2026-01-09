import { devices, expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Mobile & Responsive', { tag: ['@full', '@mobile'] }, () => {
  test.describe.configure({ mode: 'parallel' });

  test.describe('iPhone 13', () => {
    const device = devices['iPhone 13'];
    test.use({
      deviceScaleFactor: device.deviceScaleFactor,
      hasTouch: device.hasTouch,
      isMobile: device.isMobile,
      userAgent: device.userAgent,
      viewport: device.viewport,
    });

    test('Homepage renders correctly', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Verify mobile viewport
      const viewport = page.viewportSize();
      expect(viewport?.width).toBe(390);

      // Verify mobile menu exists
      const mobileMenu = page.getByRole('navigation', {
        name: 'Main navigation',
      });
      await expect(mobileMenu).toBeVisible();
    });
  });

  test.describe('iPad (gen 7)', () => {
    const device = devices['iPad (gen 7)'];
    test.use({
      deviceScaleFactor: device.deviceScaleFactor,
      hasTouch: device.hasTouch,
      isMobile: device.isMobile,
      userAgent: device.userAgent,
      viewport: device.viewport,
    });

    test('Archive page renders correctly', async ({ page }) => {
      await page.goto('/archive.html', { waitUntil: 'domcontentloaded' });

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Verify tablet viewport
      const viewport = page.viewportSize();
      expect(viewport?.width).toBe(810);

      // Verify content is readable
      const content = page.locator('main, article, .content').first();
      await expect(content).toBeVisible();
    });
  });

  test.describe('Galaxy S9+', () => {
    const device = devices['Galaxy S9+'];
    test.use({
      deviceScaleFactor: device.deviceScaleFactor,
      hasTouch: device.hasTouch,
      isMobile: device.isMobile,
      userAgent: device.userAgent,
      viewport: device.viewport,
    });

    test('Touch interactions work', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Test touch tap on link - use specific link that changes URL
      const archiveLink = page.getByRole('link', {
        exact: true,
        name: 'Archive',
      });

      await Promise.all([
        page.waitForURL(/archive/, { waitUntil: 'domcontentloaded' }),
        archiveLink.tap(),
      ]);

      // Verify navigation occurred
      await expect(page).toHaveURL(/archive/);
    });
  });

  test.describe('Responsive Breakpoints', () => {
    test('Desktop to mobile resizing', async ({ page }) => {
      // Test desktop viewport
      await page.setViewportSize({ height: 1080, width: 1920 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      let viewport = page.viewportSize();
      expect(viewport?.width).toBe(1920);

      // Test tablet viewport
      await page.setViewportSize({ height: 1024, width: 768 });
      viewport = page.viewportSize();
      expect(viewport?.width).toBe(768);

      // Test mobile viewport
      await page.setViewportSize({ height: 667, width: 375 });
      viewport = page.viewportSize();
      expect(viewport?.width).toBe(375);
    });
  });
});
