import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
    test('homepage loads correctly', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/Syafiq Hadzir/);

        // Check main content exists
        await expect(page.locator('main')).toBeVisible();

        // Check navigation exists
        await expect(page.locator('nav')).toBeVisible();
    });

    test('can navigate to archive', async ({ page }) => {
        await page.goto('/');

        // Click archive link (actual text is "See archive...")
        await page.click('text=See archive...');

        // Verify archive page
        await expect(page).toHaveURL(/archive/);
        await expect(page.locator('h1')).toContainText('Archive');
    });
    test('can navigate to a blog post', async ({ page }) => {
        await page.goto('/archive.html');

        // Click first post link
        await page.locator('a[href*="/posts/"]').first().click();

        // Verify post page
        await expect(page.locator('article')).toBeVisible();
        await expect(page.locator('h1')).toBeVisible();
    });

    test('back link returns to homepage', async ({ page }) => {
        await page.goto('/tags.html');

        // Click back link
        await page.click('text=..');

        // Verify homepage
        await expect(page).toHaveURL(/\/$/);
    });

    test('skip link is accessible', async ({ page }) => {
        await page.goto('/');

        // Tab to skip link
        await page.keyboard.press('Tab');

        // Skip link should be focused
        const skipLink = page.locator('.skip-link');
        await expect(skipLink).toBeFocused();
    });

    test('archive search shows matching posts', async ({ page }) => {
        await page.goto('/archive.html');

        // Get initial count of visible posts
        const listItems = page.locator('#archive-list li');
        const initialCount = await listItems.count();
        expect(initialCount).toBeGreaterThan(0);

        // Search by a term that should match some posts
        await page.fill('#archive-search-input', 'testing');

        // Wait for search to process by checking DOM state change
        // The search hides non-matching items via hidden attribute
        await page.waitForFunction(() => {
            const items = document.querySelectorAll('#archive-list li[hidden]');
            return items.length > 0; // Some items should be hidden after searching
        });

        // Should have fewer or equal visible items
        const visibleItems = page.locator('#archive-list li:not([hidden])');
        const filteredCount = await visibleItems.count();
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('archive search shows no results message', async ({ page }) => {
        await page.goto('/archive.html');

        // Search by nonsense term
        await page.fill('#archive-search-input', 'xyznonexistent123');

        // Wait for no-results message to become visible
        await page.locator('#no-results').waitFor({ state: 'visible' });

        // All items should be hidden
        const visibleItems = page.locator('#archive-list li:not([hidden])');
        await expect(visibleItems).toHaveCount(0);

        // No results message should be visible
        await expect(page.locator('#no-results')).toBeVisible();
    });

    test('load more years button reveals older posts', async ({ page }) => {
        await page.goto('/archive.html');

        // Check if load more button exists (only if there are more than 3 years)
        const loadMoreButton = page.locator('.load-more-years');

        // Skip test if button doesn't exist (less than 4 years of posts)
        // eslint-disable-next-line playwright/no-skipped-test
        test.skip((await loadMoreButton.count()) === 0, 'Not enough years to test load more functionality');

        // Get initial count of visible year groups
        const initialYearGroups = page.locator('.year-group:not([hidden])');
        await expect(initialYearGroups).toHaveCount(3); // Should show only 3 years initially

        // Click load more button
        await loadMoreButton.click();

        // Wait for additional years to become visible by checking the button is hidden
        await expect(loadMoreButton).toBeHidden();

        // All year groups should now be visible
        const allYearGroups = page.locator('.year-group:not([hidden])');
        const finalCount = await allYearGroups.count();
        expect(finalCount).toBeGreaterThan(3);
    });

    test('search reveals all years automatically', async ({ page }) => {
        await page.goto('/archive.html');

        // Check if load more button exists
        const loadMoreButton = page.locator('.load-more-years');

        // Skip test if button doesn't exist (less than 4 years of posts)
        // eslint-disable-next-line playwright/no-skipped-test
        test.skip((await loadMoreButton.count()) === 0, 'Not enough years to test load more functionality');

        // Button should be visible initially
        await expect(loadMoreButton).toBeVisible();

        // Start searching
        await page.fill('#archive-search-input', 'test');

        // Button should be hidden during search
        await expect(loadMoreButton).toBeHidden();

        // Clear search
        await page.fill('#archive-search-input', '');

        // Button should be visible again
        await expect(loadMoreButton).toBeVisible();
    });
});
