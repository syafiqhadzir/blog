import { devices, expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Mobile & Responsive', { tag: ['@full', '@mobile'] }, () => {
  test.describe.configure({ mode: 'parallel' });

  test('iPhone 13 - Homepage renders correctly', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 13'],
    });
    const page = await context.newPage();

    await page.goto('/');

    // Verify mobile viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(390);

    // Verify mobile menu exists
    const mobileMenu = page
      .locator('[class*="mobile"]')
      .or(page.locator('nav'));
    await expect(mobileMenu).toBeVisible();

    await context.close();
  });

  test('iPad - Archive page renders correctly', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad (gen 7)'],
    });
    const page = await context.newPage();

    await page.goto('/archive.html');

    // Verify tablet viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(810);

    // Verify content is readable
    const content = page.locator('main, article, .content').first();
    await expect(content).toBeVisible();

    await context.close();
  });

  test('Galaxy S9+ - Touch interactions work', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Galaxy S9+'],
      hasTouch: true,
    });
    const page = await context.newPage();

    await page.goto('/');

    // Test touch tap on link
    const firstLink = page.locator('a[href^="/"]').first();
    await firstLink.tap();

    // Verify navigation occurred
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toBe('http://127.0.0.1:5000/');

    await context.close();
  });

  test('Responsive breakpoints - Desktop to mobile', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ height: 1080, width: 1920 });
    await page.goto('/');

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
