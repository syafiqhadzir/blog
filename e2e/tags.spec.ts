import { expect, test } from '@playwright/test';

test.describe('Tags Page', () => {
  test.describe.configure({ mode: 'parallel' });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tags.html');
  });

  test('should display tag index with counts', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Topic');

    const tags = page.locator('.tag-chip');
    expect(await tags.count()).toBeGreaterThan(0);

    // Check if counts are visible
    const firstTagCount = tags.first().locator('.tag-chip-count');
    await expect(firstTagCount).toBeVisible();
  });

  test('should filter tags by minimum length (regression)', async ({
    page,
  }) => {
    const tags = page.locator('.tag-chip');
    const tagNames = await tags.allTextContents();

    // Based on project rules, tags should be >= 3 characters
    for (const name of tagNames) {
      // Remove the count from the text before checking length
      // Using a simple non-regex method to remove trailing numbers if possible,
      // or just a very safe regex.
      const cleanName = name.replace(/\s\d+$/, '').trim();
      expect(cleanName.length).toBeGreaterThanOrEqual(3);
    }
  });

  test('can navigate to a tag anchor from the index', async ({ page }) => {
    const firstTag = page.locator('.tag-chip').first();
    await expect(firstTag).toHaveAttribute('data-tag', /.+/);
    const tagData = await firstTag.getAttribute('data-tag');
    const slug = String(tagData).toLowerCase().replaceAll(' ', '-');

    await firstTag.click();

    // Should stay on the same page but scroll to anchor
    await expect(page).toHaveURL(new RegExp(`#${slug}`));

    // The details group for the tag should exist
    const tagSection = page.locator(`details#${slug}`);
    await expect(tagSection).toBeVisible();
  });

  test('popular topics on archive navigate to correctly filtered state', async ({
    page,
  }) => {
    await page.goto('/archive.html');

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
});
