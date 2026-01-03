import { expect, test } from '@playwright/test';

test.describe('Archive & Search', () => {
    test.describe.configure({ mode: 'parallel' });
    test.beforeEach(async ({ page }) => {
        await page.goto('/archive.html');
    });

    test('should display search input and popular topics', async ({ page }) => {
        await expect(page.locator('#archive-search-input')).toBeVisible();
        await expect(page.locator('.search-suggestions')).toBeVisible();
        await expect(page.locator('.suggestions-label')).toContainText('Popular topics');
    });

    test('should show autocomplete suggestions on typing', async ({ page }) => {
        const searchInput = page.locator('#archive-search-input');
        await searchInput.fill('test');

        // Autocomplete suggestions should appear
        const suggestions = page.locator('.amp-autocomplete-results');
        await expect(suggestions).toBeVisible();

        // Should have at least one suggestion
        const suggestionItems = suggestions.locator('.i-amphtml-autocomplete-item');
        await expect(suggestionItems.first()).toBeVisible();
    });

    test('should filter list items correctly', async ({ page }) => {
        const searchInput = page.locator('#archive-search-input');

        // Use a known specific term from our recent tag refactor
        await searchInput.fill('artificial-intelligence');

        // Wait for filtering to apply (items hidden/visible)
        await page.waitForFunction(() => {
            const items = document.querySelectorAll('#archive-list li[hidden]');
            return items.length > 0;
        });

        const visibleItems = page.locator('#archive-list li:not([hidden])');
        const count = await visibleItems.count();
        expect(count).toBeGreaterThan(0);

        // Verify that visible items actually contain the term or related data
        // (In AMP, this is driven by the state, but we check the UI)
        const firstVisibleText = await visibleItems.first().textContent();
        expect(firstVisibleText?.toLowerCase()).toContain('ai');
    });

    test('should handle case-insensitive selection from autocomplete', async ({ page }) => {
        const searchInput = page.locator('#archive-search-input');

        // Type a term
        await searchInput.fill('Security');

        // Wait for suggestions
        const suggestions = page.locator('.i-amphtml-autocomplete-item');
        await suggestions.first().waitFor();

        // Click first suggestion
        await suggestions.first().click();

        // Input should be lowercased (as per our fix)
        await expect(searchInput).toHaveValue(/^[a-z0-9-]+$/);

        // List should not be empty (regression test for "No results" on selection)
        const visibleItems = page.locator('#archive-list li:not([hidden])');
        await expect(visibleItems.first()).toBeVisible();
    });

    test('should show no results message for non-matching queries', async ({ page }) => {
        const searchInput = page.locator('#archive-search-input');
        await searchInput.fill('nonsense-query-string-12345');

        await expect(page.locator('#no-results')).toBeVisible();
        await expect(page.locator('#archive-list li:not([hidden])')).toHaveCount(0);
    });

    test('should restore popular topics when search is cleared', async ({ page }) => {
        const searchInput = page.locator('#archive-search-input');
        const suggestions = page.locator('.search-suggestions');

        await searchInput.fill('test');
        // In our current archive.html, .search-suggestions is hidden when archiveQuery is truthy
        await expect(suggestions).toBeHidden();

        await searchInput.fill('');
        await expect(suggestions).toBeVisible();
    });

    test('popular topics on archive navigate to correctly filtered state', async ({ page }) => {
        const firstTopic = page.locator('.suggestion-pill').first();
        await expect(firstTopic).toBeVisible();
        const topicName = ((await firstTopic.textContent()) ?? '').trim();
        expect(topicName).not.toBe('');

        await firstTopic.click();

        const searchInput = page.locator('#archive-search-input');
        await expect(searchInput).toHaveValue(topicName.toLowerCase());

        const visibleItems = page.locator('#archive-list li:not([hidden])');
        expect(await visibleItems.count()).toBeGreaterThan(0);
    });

    test('should toggle year groups correctly via Load More', async ({ page }) => {
        const loadMore = page.locator('.load-more-years');

        // Initially 3 years
        await expect(page.locator('details.year-group:not([hidden])')).toHaveCount(3);

        await loadMore.click();
        await expect(loadMore).toBeHidden();

        // Should show all years
        const yearGroups = page.locator('details.year-group');
        const count = await yearGroups.count();
        await expect(page.locator('details.year-group:not([hidden])')).toHaveCount(count);
    });
});
