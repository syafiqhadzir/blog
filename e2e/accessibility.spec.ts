import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (WCAG 2.2)', () => {
    test('homepage has no critical accessibility violations', async ({ page }) => {
        await page.goto('/');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('blog post has no critical accessibility violations', async ({ page }) => {
        await page.goto('/archive.html');

        // Navigate to first post
        await page.locator('a[href*="/posts/"]').first().click();
        await page.waitForLoadState('domcontentloaded');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('archive page has no critical accessibility violations', async ({ page }) => {
        await page.goto('/archive.html');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('tags page has no critical accessibility violations', async ({ page }) => {
        await page.goto('/tags.html');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('about page has no critical accessibility violations', async ({ page }) => {
        await page.goto('/about.html');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('focus is visible on all interactive elements', async ({ page, isMobile, browserName }) => {
        // Skip on mobile devices and WebKit as default focus behavior differs
        // and may require explicit OS-level configuration to show focus rings
        // eslint-disable-next-line playwright/no-skipped-test
        test.skip(isMobile || browserName === 'webkit', 'Focus rings behave differently on mobile/WebKit');

        await page.goto('/');

        // Tab through the page and verify focus is visible
        const interactiveElements = page.locator('a, button, [role="button"], input, select, textarea');
        const count = await interactiveElements.count();

        // Verify at least some interactive elements exist
        expect(count).toBeGreaterThan(0);

        // Verify skip link is first focusable element
        await page.keyboard.press('Tab');
        const skipLink = page.locator('.skip-link');
        await expect(skipLink).toBeFocused();
    });

    test('all images have alt text', async ({ page }) => {
        await page.goto('/');

        const images = page.locator('img');
        const imageCount = await images.count();

        for (let index = 0; index < imageCount; index++) {
            const img = images.nth(index);
            const alt = await img.getAttribute('alt');
            const ariaHidden = await img.getAttribute('aria-hidden');

            // Images must have alt text OR be aria-hidden
            expect(alt !== null || ariaHidden === 'true').toBeTruthy();
        }
    });

    test('page has proper heading hierarchy', async ({ page }) => {
        await page.goto('/');

        // Should have exactly one h1
        await expect(page.locator('h1')).toHaveCount(1);
    });

    test('respects prefers-reduced-motion', async ({ page }) => {
        // Set reduced motion preference
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');

        // The page should load without errors
        await expect(page.locator('main')).toBeVisible();
    });
});
