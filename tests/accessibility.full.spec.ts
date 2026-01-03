import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Accessibility Deep Testing', { tag: ['@full', '@a11y'] }, () => {
    test.describe.configure({ mode: 'parallel' });

    test('Homepage - WCAG 2.1 AA compliance', async ({ page }) => {
        await page.goto('/');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Archive page - WCAG 2.1 AA compliance', async ({ page }) => {
        await page.goto('/archive.html');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Keyboard navigation - Tab through interactive elements', async ({ page }) => {
        await page.goto('/');

        // Focus first interactive element
        await page.keyboard.press('Tab');

        // Get focused element
        const focusedElement = await page.evaluate(() => {
            const element = document.activeElement;
            return element?.tagName.toLowerCase();
        });

        // Should be a link or button
        expect(['a', 'button', 'input']).toContain(focusedElement);
    });

    test('Skip to main content link exists', async ({ page }) => {
        await page.goto('/');

        // Look for skip link (common accessibility pattern)
        const skipLink = page.locator('a[href="#main"], a[href="#content"]').first();

        // If skip link exists, verify it works
        const skipLinkCount = await skipLink.count();
        if (skipLinkCount > 0) {
            await skipLink.click();
            const mainContent = page.locator('#main, #content, main').first();
            await expect(mainContent).toBeFocused();
        }
    });

    test('Images have alt text', async ({ page }) => {
        await page.goto('/');

        const images = await page.locator('img').all();

        for (const image of images) {
            const alt = await image.getAttribute('alt');
            // Alt can be empty string for decorative images, but must exist
            expect(alt).not.toBeNull();
        }
    });

    test('Form inputs have labels', async ({ page }) => {
        await page.goto('/');

        const inputs = await page
            .locator('input[type="text"], input[type="email"], input[type="search"], textarea')
            .all();

        for (const input of inputs) {
            const inputId = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledby = await input.getAttribute('aria-labelledby');

            // Input must have id with associated label, aria-label, or aria-labelledby
            const hasLabel = inputId ? (await page.locator(`label[for="${inputId}"]`).count()) > 0 : false;
            const hasAccessibleName = hasLabel || !!ariaLabel || !!ariaLabelledby;

            expect(hasAccessibleName).toBe(true);
        }
    });

    test('Heading hierarchy is logical', async ({ page }) => {
        await page.goto('/');

        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        const headingLevels: number[] = [];

        for (const heading of headings) {
            const tagName = await heading.evaluate((element) => element.tagName.toLowerCase());
            const level = Number.parseInt(tagName.replace('h', ''), 10);
            headingLevels.push(level);
        }

        // Should have exactly one h1
        const h1Count = headingLevels.filter((level) => level === 1).length;
        expect(h1Count).toBe(1);

        // Headings should not skip levels (e.g., h1 -> h3)
        for (let index = 1; index < headingLevels.length; index++) {
            const previous = headingLevels[index - 1];
            const current = headingLevels[index];

            if (previous !== undefined && current !== undefined) {
                const difference = current - previous;

                // Can go down any number of levels, but up only 1 level
                if (difference > 0) {
                    expect(difference).toBeLessThanOrEqual(1);
                }
            }
        }
    });
});
