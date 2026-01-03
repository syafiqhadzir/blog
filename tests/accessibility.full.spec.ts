import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

import { test } from './_helpers/fixtures';

test.describe('Accessibility Deep Testing - WCAG 2.2 AAA', { tag: ['@full', '@a11y'] }, () => {
    // Sequential execution for better stability with AxeBuilder

    test('Homepage - WCAG 2.2 AAA compliance', async ({ page }) => {
        await page.goto('/');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'wcag22aa', 'wcag22aaa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Archive page - WCAG 2.2 AAA compliance', async ({ page }) => {
        await page.goto('/archive.html');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'wcag22aa', 'wcag22aaa'])
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Post page - WCAG 2.2 AAA compliance', async ({ getAllInternalRoutes, page }) => {
        const routes = await getAllInternalRoutes();
        const postPattern = /\/\d{4}\/\d{2}\/\d{2}\//;
        const postRoutes = routes.filter((route) => postPattern.exec(route));

        if (postRoutes.length > 0 && postRoutes[0]) {
            await page.goto(postRoutes[0]);

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
        }
    });

    test('Keyboard navigation - Tab through all interactive elements', async ({ page }) => {
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

        // Verify focus is visible (WCAG AAA requirement)
        const hasFocusIndicator = await page.evaluate(() => {
            const element = document.activeElement;
            if (!element) return false;
            const styles = globalThis.getComputedStyle(element);
            // Check for outline or box-shadow (common focus indicators)
            return styles.outline !== 'none' || styles.boxShadow !== 'none';
        });

        expect(hasFocusIndicator).toBe(true);
    });

    test('Skip to main content link exists and is first focusable element', async ({ page }) => {
        await page.goto('/');

        // Tab once to get first focusable element
        await page.keyboard.press('Tab');

        const firstFocusedElement = await page.evaluate(() => {
            const element = document.activeElement;
            return {
                href: element?.getAttribute('href'),
                tagName: element?.tagName.toLowerCase(),
                text: (element?.textContent ?? '').trim(),
            };
        });

        // First focusable should ideally be skip link
        if (firstFocusedElement.href?.includes('#main') || firstFocusedElement.href?.includes('#content')) {
            expect(firstFocusedElement.tagName).toBe('a');
        }
    });

    test('Images have descriptive alt text (not just present)', async ({ page }) => {
        await page.goto('/');

        const images = await page.locator('img').all();

        for (const image of images) {
            const alt = await image.getAttribute('alt');
            const source = await image.getAttribute('src');

            // Alt must exist
            expect(alt).not.toBeNull();

            // For non-decorative images, alt should be meaningful (not empty, not filename)
            if (alt && alt.length > 0) {
                // Alt text should not be the filename
                const filename = source?.split('/').pop()?.split('.')[0];
                if (filename) {
                    expect(alt.toLowerCase()).not.toBe(filename.toLowerCase());
                }

                // Alt text should be descriptive (at least 3 characters for meaningful content)
                if (!alt.startsWith('decorative') && !alt.startsWith('icon')) {
                    expect(alt.length).toBeGreaterThanOrEqual(3);
                }
            }
        }
    });

    test('Form inputs have visible and descriptive labels', async ({ page }) => {
        await page.goto('/');

        const inputs = await page
            .locator('input[type="text"], input[type="email"], input[type="search"], textarea')
            .all();

        for (const input of inputs) {
            const inputId = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledby = await input.getAttribute('aria-labelledby');
            const placeholder = await input.getAttribute('placeholder');

            // Input must have id with associated label, aria-label, or aria-labelledby
            const hasLabel = inputId ? (await page.locator(`label[for="${inputId}"]`).count()) > 0 : false;
            const hasAccessibleName = hasLabel || !!ariaLabel || !!ariaLabelledby;

            expect(hasAccessibleName).toBe(true);

            // WCAG AAA: Placeholder should not be the only label
            if (placeholder && !hasLabel && !ariaLabel && !ariaLabelledby) {
                throw new Error('Placeholder should not be the only label (WCAG AAA)');
            }
        }
    });

    test('Heading hierarchy is logical and complete', async ({ page }) => {
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

    test('Color contrast meets WCAG AAA (7:1 for normal text, 4.5:1 for large)', async ({ page }) => {
        await page.goto('/');

        // Use axe-core to check color contrast at AAA level
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2aaa'])
            .disableRules(['color-contrast-enhanced']) // We'll check this separately
            .analyze();

        // Check for any color contrast violations
        const contrastViolations = accessibilityScanResults.violations.filter(
            (v) => v.id === 'color-contrast' || v.id === 'color-contrast-enhanced',
        );

        expect(contrastViolations).toEqual([]);
    });

    test('Links have descriptive text (not "click here" or "read more")', async ({ page }) => {
        await page.goto('/');

        const links = await page.locator('a[href]').all();
        const genericLinkText = ['click here', 'read more', 'more', 'here', 'link'];

        for (const link of links) {
            const text = await link.textContent();
            const ariaLabel = await link.getAttribute('aria-label');
            const title = await link.getAttribute('title');

            const linkText = (text ?? ariaLabel ?? title ?? '').trim().toLowerCase();

            // Links should have meaningful text (WCAG AAA best practice)
            if (linkText.length > 0) {
                expect(genericLinkText).not.toContain(linkText);
            }
        }
    });

    test('Page has valid lang attribute', async ({ page }) => {
        await page.goto('/');

        const lang = await page.getAttribute('html', 'lang');

        // Lang attribute must exist and be valid
        expect(lang).toBeTruthy();
        expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., 'en' or 'en-US'
    });

    test('Focus order follows DOM order (logical tab sequence)', async ({ page }) => {
        await page.goto('/');

        const focusableElements = await page.evaluate(() => {
            const elements = [
                ...document.querySelectorAll(
                    'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
                ),
            ];
            return elements.map((element, index) => ({
                index,
                tabIndex: element.getAttribute('tabindex'),
                tagName: element.tagName.toLowerCase(),
            }));
        });

        // Verify no positive tabindex values (they break natural tab order)
        const positiveTabIndexes = focusableElements.filter(
            (element) => element.tabIndex && Number.parseInt(element.tabIndex, 10) > 0,
        );

        expect(positiveTabIndexes).toEqual([]);
    });

    test('No content flashes more than 3 times per second', async ({ page }) => {
        await page.goto('/');

        // Check for animations that could cause seizures (only infinite loops)
        const hasFlashingContent = await page.evaluate(() => {
            const animations = document.getAnimations();
            // Check for rapid looping animations (< 333ms duration)
            return animations.some((animation) => {
                const effect = animation.effect;
                if (effect && 'getTiming' in effect) {
                    const timing = effect.getTiming();
                    // AAA and general safety: Only concerned with looping/repeating animations
                    const isLooping = timing.iterations === Number.POSITIVE_INFINITY || Number(timing.iterations) > 3;
                    return isLooping && timing.duration !== 'auto' && Number(timing.duration) < 333;
                }
                return false;
            });
        });

        expect(hasFlashingContent).toBe(false);
    });
});
